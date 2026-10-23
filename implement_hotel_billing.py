from pathlib import Path
import shutil

ROOT = Path.cwd()
APP = ROOT / "src/App.tsx"
API = ROOT / "src/api.ts"
SERVER = ROOT / "server/index.ts"
for path in (APP, API, SERVER):
    if not path.is_file():
        raise SystemExit(f"Run from project root; missing {path}")
    backup = path.with_suffix(path.suffix + ".billing-backup")
    if backup.exists():
        raise SystemExit(f"Backup exists already: {backup}. No files changed.")

# Validate every insertion point before writing anything.
api_text = API.read_text(encoding="utf-8")
server_text = SERVER.read_text(encoding="utf-8")
app_text = APP.read_text(encoding="utf-8")
api_marker = "  createExpense: (data: any) => request<any>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),"
server_marker = "app.get('/api/v1/housekeeping/tasks'"
finance_marker = "function Finance() {"
maintenance_marker = "function Maintenance() {"
if api_text.count(api_marker) != 1:
    raise SystemExit("Expected exactly one createExpense API marker.")
if server_text.count(server_marker) != 1:
    raise SystemExit("Expected exactly one housekeeping route marker.")
if app_text.count(finance_marker) != 1 or app_text.count(maintenance_marker) != 1:
    raise SystemExit("Could not uniquely identify Finance component boundaries.")

api_new = api_text.replace(api_marker, api_marker + """
  billing: () => request<any>('/billing'),
  updateBillingSettings: (id: string, data: any) => request<any>(`/billing/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
  recordPayment: (data: any) => request<any>('/billing/payments', { method: 'POST', body: JSON.stringify(data) }),""")

routes = r"""
function getBillingRows(d: AnyRecord) {
  const today = new Date().toISOString().slice(0, 10);
  const settings = Array.isArray(d.billingSettings) ? d.billingSettings : [];
  const payments = Array.isArray(d.payments) ? d.payments : [];
  return (d.reservations || [])
    .filter((r: AnyRecord) => !['Cancelled', 'No-show'].includes(String(r.status || '')))
    .map((r: AnyRecord) => {
      const cfg = settings.find((x: AnyRecord) => x.reservationId === r.id) || {};
      const rentalType = cfg.rentalType === 'Monthly' ? 'Monthly' : 'Daily';
      const monthlyRate = Math.max(0, Number(cfg.monthlyRate || 0));
      const segments: any[] = [];
      let charge = 0;
      if (rentalType === 'Daily') {
        charge = Math.max(0, Number(r.amount || 0));
        segments.push({ dueDate: String(r.checkIn || today) });
      } else if (monthlyRate > 0 && r.checkIn && r.checkOut) {
        const start = new Date(`${r.checkIn}T00:00:00Z`).getTime();
        const end = new Date(`${r.checkOut}T00:00:00Z`).getTime();
        const nightsByMonth: Record<string, number> = {};
        for (let t = start; t < end; t += 86400000) {
          const month = new Date(t).toISOString().slice(0, 7);
          nightsByMonth[month] = (nightsByMonth[month] || 0) + 1;
        }
        for (const [month, nights] of Object.entries(nightsByMonth)) {
          const [year, monthNo] = month.split('-').map(Number);
          const days = new Date(Date.UTC(year, monthNo, 0)).getUTCDate();
          charge += Math.round(monthlyRate / days * nights);
          segments.push({ dueDate: `${month}-05` });
        }
      }
      const reservationPayments = payments.filter((x: AnyRecord) => x.reservationId === r.id);
      const paid = reservationPayments.reduce((sum: number, x: AnyRecord) => sum + Math.max(0, Number(x.amount || 0)), 0);
      const balance = Math.max(0, charge - paid);
      const dueDate = segments.map(x => x.dueDate).sort()[0] || String(r.checkIn || today);
      const status = rentalType === 'Monthly' && monthlyRate <= 0 ? 'Setup needed'
        : balance <= 0 ? 'Paid' : dueDate < today ? 'Overdue' : 'Due';
      return { reservationId: r.id, guest: r.guest, room: r.room, propertyId: r.propertyId,
        checkIn: r.checkIn, checkOut: r.checkOut, reservationStatus: r.status,
        rentalType, monthlyRate, charge, paid, balance, dueDate, status, payments: reservationPayments };
    })
    .sort((a: AnyRecord, b: AnyRecord) => String(a.dueDate).localeCompare(String(b.dueDate)));
}

app.get('/api/v1/billing', (_req, res) => {
  const d = readData();
  res.json({ data: getBillingRows(d), payments: Array.isArray(d.payments) ? d.payments : [] });
});

app.patch('/api/v1/billing/:reservationId', (req, res) => {
  const d = readData();
  const r = (d.reservations || []).find((x: AnyRecord) => x.id === req.params.reservationId);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  const rentalType = req.body.rentalType === 'Monthly' ? 'Monthly' : 'Daily';
  const monthlyRate = Number(req.body.monthlyRate || 0);
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0 || (rentalType === 'Monthly' && monthlyRate <= 0))
    return res.status(400).json({ error: 'Enter a valid monthly rent amount for monthly stays.' });
  if (!Array.isArray(d.billingSettings)) d.billingSettings = [];
  const setting = d.billingSettings.find((x: AnyRecord) => x.reservationId === r.id);
  if (setting) Object.assign(setting, { rentalType, monthlyRate });
  else d.billingSettings.push({ reservationId: r.id, rentalType, monthlyRate });
  writeData(d);
  res.json({ data: getBillingRows(d).find((x: AnyRecord) => x.reservationId === r.id) });
});

app.post('/api/v1/billing/payments', (req, res) => {
  const d = readData();
  const reservationId = String(req.body.reservationId || '');
  if (!(d.reservations || []).some((x: AnyRecord) => x.id === reservationId))
    return res.status(404).json({ error: 'Reservation not found' });
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return res.status(400).json({ error: 'Payment amount must be greater than zero.' });
  if (!Array.isArray(d.payments)) d.payments = [];
  const payment = { id: `PAY-${Date.now()}`, reservationId,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    amount: Math.round(amount), method: String(req.body.method || 'Cash'),
    notes: String(req.body.notes || '').slice(0, 500) };
  d.payments.unshift(payment);
  if (!Array.isArray(d.activity)) d.activity = [];
  d.activity.unshift({ id: Date.now(), text: `Payment recorded for reservation ${reservationId}`,
    by: 'Finance', time: new Date().toISOString().slice(11, 16) });
  writeData(d);
  res.status(201).json({ data: payment, billing: getBillingRows(d).find((x: AnyRecord) => x.reservationId === reservationId) });
});

"""
server_new = server_text.replace(server_marker, routes + server_marker)

finance = r"""function Finance() {
  const [rows,setRows] = useState<AnyRow[]>([]);
  const [bills,setBills] = useState<AnyRow[]>([]);
  const [query,setQuery] = useState('');
  const [open,setOpen] = useState(false);
  const [view,setView] = useState<'expenses'|'billing'>('expenses');
  const [modal,setModal] = useState<'configure'|'payment'|null>(null);
  const [selected,setSelected] = useState<AnyRow|null>(null);
  const [error,setError] = useState('');
  const today = new Date().toISOString().slice(0,10);
  const load=()=>api.expenses(query).then(r=>setRows(r.data)).catch(()=>{});
  const loadBills=()=>api.billing().then(r=>setBills(r.data)).catch(()=>{});
  useEffect(()=>{load();},[query]);
  useEffect(()=>{loadBills();},[]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);await api.createExpense({description:f.get('description'),category:f.get('category'),property:f.get('property'),amount:f.get('amount'),date:f.get('date')});setOpen(false);load();}
  async function saveConfig(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!selected)return;const f=new FormData(e.currentTarget);try{await api.updateBillingSettings(selected.reservationId,{rentalType:f.get('rentalType'),monthlyRate:f.get('monthlyRate')});setModal(null);setSelected(null);setError('');loadBills();}catch(err:any){setError(err.message||'Could not save settings.');}}
  async function savePayment(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!selected)return;const f=new FormData(e.currentTarget);try{await api.recordPayment({reservationId:selected.reservationId,amount:f.get('amount'),date:f.get('date'),method:f.get('method'),notes:f.get('notes')});setModal(null);setSelected(null);setError('');loadBills();}catch(err:any){setError(err.message||'Could not record payment.');}}
  const total=rows.reduce((s,r)=>s+Number(r.amount||0),0);
  const charges=bills.reduce((s,r)=>s+Number(r.charge||0),0), paid=bills.reduce((s,r)=>s+Number(r.paid||0),0), balance=bills.reduce((s,r)=>s+Number(r.balance||0),0);
  return <>
    <PageHeader eyebrow="FINANCE" title="Finance & expenses" description="Track operating expenses, guest charges, payments, and outstanding balances." actions={view==='expenses'?<Button onClick={()=>setOpen(true)}><Plus size={16}/> Record expense</Button>:undefined}/>
    <div className="toolbar"><Button variant={view==='expenses'?'primary':'secondary'} onClick={()=>setView('expenses')}>Expenses</Button><Button variant={view==='billing'?'primary':'secondary'} onClick={()=>setView('billing')}>Guest billing</Button></div>
    {view==='expenses'?<>
      <div className="mini-stat-grid"><div><span>Total expenses</span><strong>{money(total)}</strong></div><div><span>Awaiting approval</span><strong>{rows.filter(r=>r.status==='Pending').length}</strong></div><div><span>Approved</span><strong>{rows.filter(r=>r.status==='Approved').length}</strong></div><div><span>Records</span><strong>{rows.length}</strong></div></div>
      <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search expense records…"/></div>
      <Panel title="Expense register" subtitle="Existing expense records are preserved"><div className="table-scroll"><table><thead><tr><th>DATE / REFERENCE</th><th>DESCRIPTION</th><th>CATEGORY</th><th>PROPERTY</th><th>STATUS</th><th>AMOUNT</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.date}</strong><span className="cell-sub">{r.id}</span></td><td>{r.description}</td><td>{r.category}</td><td>{r.property}</td><td><Badge tone={r.status==='Approved'?'success':'warning'}>{r.status}</Badge></td><td className="amount-cell">{money(r.amount)}</td></tr>)}</tbody></table></div></Panel>
    </>:<>
      <div className="mini-stat-grid"><div><span>Guest charges</span><strong>{money(charges)}</strong></div><div><span>Payments recorded</span><strong>{money(paid)}</strong></div><div><span>Outstanding balance</span><strong>{money(balance)}</strong></div><div><span>Overdue accounts</span><strong>{bills.filter(r=>r.status==='Overdue').length}</strong></div></div>
      <div className="notice"><AlertTriangle size={17}/><div><strong>Billing rules</strong><span>Daily stays use the existing reservation amount and are due on check-in. Monthly stays are prorated by actual calendar-month days and due by the 5th. Check-in night counts; checkout date does not. Existing reservations default to Daily, and no booking is assumed paid.</span></div></div>
      <Panel title="Guest billing register" subtitle="Billing settings and payments are stored separately from reservations."><div className="table-scroll"><table><thead><tr><th>RESERVATION / GUEST</th><th>ROOM</th><th>TYPE</th><th>STAY</th><th>CHARGES</th><th>PAID</th><th>BALANCE</th><th>DUE DATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
        {bills.map(r=><tr key={r.reservationId}><td><strong>{r.reservationId}</strong><span className="cell-sub">{r.guest}</span></td><td>{r.room}</td><td>{r.rentalType}{r.rentalType==='Monthly'&&r.monthlyRate>0?<span className="cell-sub">{money(r.monthlyRate)}/month</span>:null}</td><td>{r.checkIn}<span className="cell-sub">to {r.checkOut}</span></td><td className="amount-cell">{money(r.charge)}</td><td className="amount-cell">{money(r.paid)}</td><td className="amount-cell"><strong>{money(r.balance)}</strong></td><td>{r.dueDate}</td><td><Badge tone={r.status==='Paid'?'success':r.status==='Overdue'||r.status==='Setup needed'?'warning':'neutral'}>{r.status}</Badge></td><td><div className="table-actions"><Button variant="secondary" onClick={()=>{setSelected(r);setError('');setModal('configure');}}>Configure</Button><Button onClick={()=>{setSelected(r);setError('');setModal('payment');}} disabled={r.status==='Setup needed'}>Record payment</Button></div></td></tr>)}
        {!bills.length&&<tr><td colSpan={10}>No billable reservations found.</td></tr>}
      </tbody></table></div></Panel>
      <Panel title="Payment history" subtitle="Actual recorded payments; existing bookings have no assumed payments."><div className="table-scroll"><table><thead><tr><th>DATE / PAYMENT</th><th>RESERVATION</th><th>METHOD</th><th>NOTES</th><th>AMOUNT</th></tr></thead><tbody>
        {bills.flatMap(r=>(r.payments||[]).map((p:AnyRow)=>({...p,guest:r.guest}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).map((p:AnyRow)=><tr key={p.id}><td><strong>{p.date}</strong><span className="cell-sub">{p.id}</span></td><td>{p.reservationId}<span className="cell-sub">{p.guest}</span></td><td>{p.method}</td><td>{p.notes||'—'}</td><td className="amount-cell">{money(p.amount)}</td></tr>)}
        {!bills.some(r=>(r.payments||[]).length>0)&&<tr><td colSpan={5}>No payments recorded yet.</td></tr>}
      </tbody></table></div></Panel>
    </>}
    {open&&<Modal title="Record an expense" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2">Description<input name="description" required placeholder="What was purchased or paid for?"/></label><label>Category<select name="category"><option>Utilities</option><option>Supplies</option><option>Maintenance</option><option>Payroll</option><option>Marketing</option><option>Other</option></select></label><label>Business unit<select name="property"><option>Hotel A</option><option>Hotel B</option></select></label><label>Amount (VND)<input type="number" name="amount" min="1" required/></label><label>Date<input type="date" name="date" defaultValue={today}/></label><div className="form-actions span-2"><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit">Save expense</Button></div></form></Modal>}
    {modal==='configure'&&selected&&<Modal title={`Billing settings · ${selected.reservationId}`} onClose={()=>{setModal(null);setSelected(null);setError('');}}><form className="form-grid" onSubmit={saveConfig}><p className="span-2">Guest: <strong>{selected.guest}</strong>, room {selected.room}. Reservation amount and dates will not be changed.</p><label className="span-2">Rental type<select name="rentalType" defaultValue={selected.rentalType}><option value="Daily">Daily — existing reservation amount</option><option value="Monthly">Monthly — calendar-day proration</option></select></label><label className="span-2">Monthly rent (VND)<input name="monthlyRate" type="number" min="1" defaultValue={selected.monthlyRate||''} placeholder="Required for monthly stays"/></label>{error&&<p className="span-2">{error}</p>}<div className="form-actions span-2"><Button variant="secondary" onClick={()=>{setModal(null);setSelected(null);}}>Cancel</Button><Button type="submit">Save settings</Button></div></form></Modal>}
    {modal==='payment'&&selected&&<Modal title={`Record payment · ${selected.reservationId}`} onClose={()=>{setModal(null);setSelected(null);setError('');}}><form className="form-grid" onSubmit={savePayment}><p className="span-2">Guest: <strong>{selected.guest}</strong>. Balance: <strong>{money(selected.balance)}</strong></p><label>Amount (VND)<input name="amount" type="number" min="1" max={Math.max(1,selected.balance)} defaultValue={selected.balance>0?selected.balance:''} required/></label><label>Payment date<input name="date" type="date" defaultValue={today} required/></label><label>Method<select name="method"><option>Cash</option><option>Bank transfer</option><option>Card</option><option>Other</option></select></label><label>Notes<input name="notes" maxLength={500} placeholder="Optional reference"/></label>{error&&<p className="span-2">{error}</p>}<div className="form-actions span-2"><Button variant="secondary" onClick={()=>{setModal(null);setSelected(null);}}>Cancel</Button><Button type="submit">Save payment</Button></div></form></Modal>}
  </>;
}
"""
a, b = app_text.index(finance_marker), app_text.index(maintenance_marker, app_text.index(finance_marker))
app_new = app_text[:a] + finance + app_text[b:]

# Only now create backups and write all three validated edits.
for path in (APP, API, SERVER):
    shutil.copy2(path, path.with_suffix(path.suffix + ".billing-backup"))
API.write_text(api_new, encoding="utf-8")
SERVER.write_text(server_new, encoding="utf-8")
APP.write_text(app_new, encoding="utf-8")
print("Billing patch applied. Backups created with .billing-backup suffix.")
