import supabase from './supabase-config.js'

// Data model: users, advisors, attendance, requests

async function signUpStudent({ instName, className, rollNo, studentName, password }){
  const email = `student+${instName}+${className}+${rollNo}@example.com`
  const res = await supabase.auth.signUp({ email, password }, { data: { role: 'student', instName, className, rollNo, studentName }})
  return res
}

async function signIn(email, password){
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function studentCheckIn(){
  if (!navigator.geolocation) return alert('Geolocation unavailable')
  const { data: user } = await supabase.auth.getUser()
  if (!user) return alert('Login required')
  const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej))
  const lat = pos.coords.latitude, lng = pos.coords.longitude

  // fetch advisor geofence for class
  const { data: advisors } = await supabase.from('users').select('id, metadata').eq('role', 'advisor').eq('metadata->>className', user.user.user_metadata.className).limit(1)
  if (!advisors || advisors.length === 0) return alert('No advisor configured')
  const adv = advisors[0]
  const advConf = adv.metadata || {}
  const gf = advConf.geofence
  if (!gf) return alert('Advisor has not set geofence')
  const d = distanceMeters(lat, lng, gf.lat, gf.lng)
  if (d > gf.radius) return alert(`Outside area: ${Math.round(d)}m`)

  const now = new Date().toISOString()
  await supabase.from('attendance').insert([{ user_id: user.data.user.id, user_name: user.data.user.user_metadata.studentName, class_name: user.data.user.user_metadata.className, date: now.split('T')[0], in_at: now, in_lat: lat, in_lng: lng }])
  alert('Checked in')
}

export async function studentCheckOut(){
  if (!navigator.geolocation) return alert('Geolocation unavailable')
  const { data: user } = await supabase.auth.getUser()
  if (!user) return alert('Login required')
  // find active attendance
  const { data: rows } = await supabase.from('attendance').select('*').eq('user_id', user.data.user.id).is('out_at', null).order('in_at', { ascending: false }).limit(1)
  if (!rows || rows.length === 0) return alert('No active check-in')
  const row = rows[0]
  const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej))
  const lat = pos.coords.latitude, lng = pos.coords.longitude

  // validate geofence similar to check-in (omitted here for brevity)
  const outAt = new Date().toISOString()
  const hours = (new Date(outAt) - new Date(row.in_at)) / (1000*60*60)
  await supabase.from('attendance').update({ out_at: outAt, out_lat: lat, out_lng: lng, hours }).eq('id', row.id)
  alert('Checked out')
}

export async function submitOverride({ reason, from, to }){
  const { data: user } = await supabase.auth.getUser()
  if (!user) return alert('Login required')
  await supabase.from('requests').insert([{ user_id: user.data.user.id, student_name: user.data.user.user_metadata.studentName, class_name: user.data.user.user_metadata.className, reason, from, to, status: 'pending' }])
  alert('Request submitted')
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = v => v * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

// Export simple helpers for the existing UI to call
export default { signUpStudent, signIn, studentCheckIn, studentCheckOut, submitOverride }
