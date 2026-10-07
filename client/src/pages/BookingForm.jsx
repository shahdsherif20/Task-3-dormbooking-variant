import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// The server sends "2026-10-10T00:00:00.000Z"; a date input only accepts "2026-10-10".
function toDateInput(d) {
  return d ? d.slice(0, 10) : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the booking and fill the form with it.
  useEffect(() => {
    if (!id) return
    api.get('/bookings/' + id)
      .then(res => {
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber,
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || ''
        })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load booking'))
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // Never send bookedBy: the server takes the booker from the token.
    const { roomNumber, startDate, endDate, purpose } = form
    const body = { roomNumber, startDate, endDate, purpose }
    try {
      if (id) await api.patch('/bookings/' + id, body)
      else await api.post('/bookings', body)
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" name="roomNumber" placeholder="Room number (e.g. B2-104)" value={form.roomNumber} onChange={onChange} required />
        <label className="block">
          <span className="text-sm">Start date</span>
          <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} required />
        </label>
        <label className="block">
          <span className="text-sm">End date</span>
          <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
        </label>
        <textarea className="input" name="purpose" placeholder="Purpose (optional)" rows={3} value={form.purpose} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
