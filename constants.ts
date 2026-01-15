import React from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  LayoutDashboard, 
  Bell, 
  BarChart2, 
  MessageSquare, 
  ClipboardList,
  Clock
} from 'lucide-react';
import { User, AssignmentStatus } from './types';

export const LOCATIONS = [
  'CENTRO SALUD',
  'LA BARBERA',
  'EL CENSAL',
  'Dr. ESQUERDO',
  'LA CREUETA'
];

// Efectos de sonido UI de alta calidad
export const SOUNDS = {
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  ALERT: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  LOGOUT: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  POP: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
};

export const MOCK_USERS: User[] = [];

export const LOCATION_COLORS = [
  { name: 'LA BARBERA', hex: '#1E88E5' },
  { name: 'EL CENSAL', hex: '#43A047' },
  { name: 'CENTRO SALUD', hex: '#FB8C00' },
  { name: 'Dr. ESQUERDO', hex: '#E53935' },
  { name: 'LA CREUETA', hex: '#8E24AA' },
];

export const MOTIVATIONAL_PHRASES = [
  "¡Tu esfuerzo hace que nuestra Vila sea un lugar mejor!",
  "¡Gracias por tu dedicación, eres una pieza clave en el equipo!",
  "El tiempo que regalas es el regalo más valioso. ¡Gracias!",
  "¡Buen trabajo! Descansa y recarga pilas para el próximo día.",
  "¡Eres increíble! Gracias por estar siempre al pie del cañón.",
  "Tu sonrisa y tu trabajo marcan la diferencia. ¡Sigue así!",
  "¡Misión cumplida! Gracias por tu puntualidad y compromiso.",
  "¡Gran labor! El éxito del PPOC es gracias a personas como tú.",
  "¡Gracias por tu tiempo y tu energía! Nos vemos en el próximo turno.",
  "¡Qué suerte tenerte con nosotros! ¡A por el siguiente!",
];

export const NAV_ITEMS_COORD = [
  { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
  { id: 'users', label: 'Usuarios', icon: <Users size={20} /> },
  { id: 'planning', label: 'Planificación', icon: <ClipboardList size={20} /> },
  { id: 'alerts', label: 'Alertas', icon: <Bell size={20} /> },
  { id: 'stats', label: 'Estadísticas', icon: <BarChart2 size={20} /> },
  { id: 'comms', label: 'Mensajes', icon: <MessageSquare size={20} /> },
];

export const NAV_ITEMS_USER = [
  { id: 'home', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
  { id: 'availability', label: 'Disponibilidad', icon: <Clock size={20} /> },
  { id: 'messages', label: 'Mensajes', icon: <MessageSquare size={20} /> },
  { id: 'notifications', label: 'Avisos', icon: <Bell size={20} /> },
];

export const OCR_SEED_SYSTEM_PROMPT = `
Extract structured shift information from the provided images of WhatsApp shift lists.
Return JSON with the following structure:
{
  "locations": [{ "name": "STRING", "color_hex": "HEX" }],
  "users": [{ "display_name": "STRING" }],
  "shifts": [{ "date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM", "location": "STRING", "max_people": 2, "notes": "" }],
  "assignments": [{ "shift_date": "YYYY-MM-DD", "shift_location": "STRING", "user": "STRING" }]
}
Identify unique locations and assign them a color.
The month is January 2026.
If multiple people are listed for a shift, include all in assignments.
`;

// Extracted data from user images
export const SEED_DATA = {
  locations: [
    { name: 'LA BARBERA', color_hex: '#1E88E5' },
    { name: 'LA CREUETA', color_hex: '#8E24AA' },
    { name: 'EL CENSAL', color_hex: '#43A047' },
    { name: 'CENTRO SALUD', color_hex: '#FB8C00' },
    { name: 'Dr. ESQUERDO', color_hex: '#E53935' },
  ],
  users: [
    "ANA GABRIELA", "ROSA BARBER", "DOLY ABELLÁN", "JESÚS ROIG", "MAITE ROIG",
    "JOSÉ MANUEL MONTES", "JONATHAN LLAMAS", "OTILIA MONTES", "CONCHI CÁNOVAS",
    "ARACELI GARRIDO", "JUANITA ROMERO", "ANDREA ORQUIN", "TOÑI LÓPEZ",
    "PAULA ALGUACIL", "FERNANDO VÍLCHEZ", "RODOLFO GONZÁLEZ", "ANA CÁNOVAS",
    "ADELA CARRILLO", "JACQUELINE CARNEIRO", "MANUELA CRESCIMANNO", "JAVIER ESTRADA",
    "PAQUI ESTRADA", "NATÁN ZAMORA", "DESI ZAMORA", "PARÍS ZAMORA", "ROBERTO PÉREZ",
    "PALOMA PÉREZ", "TOÑI ESCANERO", "BLANCA CALVO", "ANA VÍLCHEZ", "ANABEL LLAMAS",
    "MISAEL GORDILLO", "RAQUEL GORDILLO", "MARI CHEDA", "Mª CARMEN ORQUIN",
    "JORGE TORRES", "ABIGAIL TORRES", "MARTA LUCIA MORALES", "AURELIO GARCÍA",
    "JOSÉ RAMÓN ORQUIN", "BARTOLOMÉ ROMERO", "LITO CHEDA", "DEMETRIO MENESES",
    "LIA LÓPEZ", "JONY LÓPEZ", "NOELIA LÓPEZ", "DANIEL LÓPEZ", "LEMUEL GORDILLO",
    "JANINE GORDILLO", "MÍRIAM DEVESA", "JOSÉ DEVESA", "MÓNICA BALLESTER",
    "PAQUI LEAL", "CARMINA JIMÉNEZ", "MÓNICA GONZÁLEZ", "PATTY CRESCIMANNO",
    "JOSÉ CARNEIRO", "KEVIN BALLESTER", "ANA GABRIELA JIMÉNEZ"
  ],
  raw_shifts: [
    { date: '2026-01-27', time: '10:30-12:30', loc: 'LA BARBERA', people: ['ANA GABRIELA', 'ROSA BARBER', 'DOLY ABELLÁN'] },
    { date: '2026-01-27', time: '10:30-12:30', loc: 'LA CREUETA', people: ['JESÚS ROIG', 'MAITE ROIG'] },
    { date: '2026-01-27', time: '17:30-19:30', loc: 'EL CENSAL', people: ['JOSÉ MANUEL MONTES', 'JONATHAN LLAMAS'] },
    { date: '2026-01-27', time: '17:30-19:30', loc: 'LA BARBERA', people: ['OTILIA MONTES', 'CONCHI CÁNOVAS'] },
    { date: '2026-01-29', time: '10:30-12:30', loc: 'CENTRO SALUD', people: ['ARACELI GARRIDO', 'JUANITA ROMERO', 'ANDREA ORQUIN'] },
    { date: '2026-01-29', time: '10:30-12:30', loc: 'LA BARBERA', people: ['TOÑI LÓPEZ', 'PAULA ALGUACIL'] },
    { date: '2026-01-29', time: '17:30-19:30', loc: 'EL CENSAL', people: ['FERNANDO VÍLCHEZ', 'RODOLFO GONZÁLEZ'] },
    { date: '2026-01-29', time: '17:30-19:30', loc: 'LA BARBERA', people: ['ANA CÁNOVAS', 'ADELA CARRILLO'] },
    { date: '2026-01-31', time: '10:30-12:00', loc: 'Dr. ESQUERDO', people: ['JACQUELINE CARNEIRO', 'MANUELA CRESCIMANNO'] },
    { date: '2026-01-31', time: '12:00-13:30', loc: 'Dr. ESQUERDO', people: ['JAVIER ESTRADA', 'PAQUI ESTRADA'] },
    { date: '2026-01-31', time: '10:30-12:00', loc: 'EL CENSAL', people: ['NATÁN ZAMORA', 'DESI ZAMORA', 'PARÍS ZAMORA'] },
    { date: '2026-01-31', time: '12:00-13:30', loc: 'EL CENSAL', people: ['ROBERTO PÉREZ', 'PALOMA PÉREZ'] },
    { date: '2026-01-08', time: '10:30-12:30', loc: 'CENTRO SALUD', people: ['TOÑI ESCANERO', 'ARACELI GARRIDO', 'BLANCA CALVO'] },
    { date: '2026-01-08', time: '10:30-12:30', loc: 'LA BARBERA', people: ['ANA VÍLCHEZ', 'ANABEL LLAMAS'] },
    { date: '2026-01-08', time: '17:30-19:30', loc: 'EL CENSAL', people: ['MISAEL GORDILLO', 'RAQUEL GORDILLO'] },
    { date: '2026-01-08', time: '17:30-19:30', loc: 'LA BARBERA', people: ['MARI CHEDA', 'Mª CARMEN ORQUIN'] },
    { date: '2026-01-10', time: '10:30-12:00', loc: 'Dr. ESQUERDO', people: ['JORGE TORRES', 'ABIGAIL TORRES'] },
    { date: '2026-01-10', time: '12:00-13:30', loc: 'Dr. ESQUERDO', people: ['MARTA LUCIA MORALES', 'ANA GABRIELA JIMÉNEZ'] },
    { date: '2026-01-10', time: '10:30-12:00', loc: 'EL CENSAL', people: ['AURELIO GARCÍA', 'MÓNICA GARCÍA', 'PARÍS ZAMORA'] },
    { date: '2026-01-10', time: '12:00-13:30', loc: 'EL CENSAL', people: ['JOSÉ RAMÓN ORQUIN', 'BARTOLOMÉ ROMERO'] },
    { date: '2026-01-13', time: '10:30-12:30', loc: 'LA BARBERA', people: ['ROSA BARBER', 'JESÚS ROIG', 'MAITE ROIG'] },
    { date: '2026-01-13', time: '10:30-12:30', loc: 'LA CREUETA', people: ['ROBERTO PÉREZ', 'PALOMA PÉREZ'] },
    { date: '2026-01-13', time: '17:30-19:30', loc: 'EL CENSAL', people: ['ADELA CARRILLO', 'ANDREA ORQUIN'] },
    { date: '2026-01-13', time: '17:30-19:30', loc: 'LA BARBERA', people: ['FERNANDO VÍLCHEZ', 'JONATHAN LLAMAS', 'LITO CHEDA'] },
    { date: '2026-01-15', time: '10:30-12:30', loc: 'CENTRO SALUD', people: ['JUANITA ROMERO', 'TOÑI LÓPEZ'] },
    { date: '2026-01-15', time: '10:30-12:30', loc: 'LA BARBERA', people: ['MANUELA CRESCIMANNO', 'PAULA ALGUACIL'] },
    { date: '2026-01-15', time: '17:30-19:30', loc: 'EL CENSAL', people: ['JAVIER ESTRADA', 'PAQUI ESTRADA'] },
    { date: '2026-01-15', time: '17:30-19:30', loc: 'LA BARBERA', people: ['JOSÉ MANUEL MONTES', 'OTILIA MONTES'] },
    { date: '2026-01-17', time: '10:30-12:00', loc: 'Dr. ESQUERDO', people: ['NATÁN ZAMORA', 'DESI ZAMORA', 'PARÍS ZAMORA'] },
    { date: '2026-01-17', time: '12:00-13:30', loc: 'Dr. ESQUERDO', people: ['DEMETRIO MENESES', 'RODOLFO GONZÁLEZ'] },
    { date: '2026-01-17', time: '10:30-12:00', loc: 'EL CENSAL', people: ['DANIEL LÓPEZ', 'NOELIA LÓPEZ', 'JONY LÓPEZ', 'LIA LÓPEZ'] },
    { date: '2026-01-17', time: '12:00-13:30', loc: 'EL CENSAL', people: ['LEMUEL GORDILLO', 'JANINE GORDILLO'] },
    { date: '2026-01-20', time: '10:30-12:30', loc: 'LA BARBERA', people: ['ROSA BARBER', 'PALOMA PÉREZ', 'MÍRIAM DEVESA'] },
    { date: '2026-01-20', time: '10:30-12:30', loc: 'LA CREUETA', people: ['ROBERTO PÉREZ', 'JOSÉ DEVESA', 'BARTOLOMÉ ROMERO'] },
    { date: '2026-01-20', time: '17:30-19:30', loc: 'EL CENSAL', people: ['CONCHI CÁNOVAS', 'MÓNICA BALLESTER', 'ANDREA ORQUIN'] },
    { date: '2026-01-20', time: '17:30-19:30', loc: 'LA BARBERA', people: ['ANA CÁNOVAS', 'JACQUELINE CARNEIRO'] },
    { date: '2026-01-22', time: '10:30-12:30', loc: 'CENTRO SALUD', people: ['BLANCA CALVO', 'MARI CHEDA', 'ANA VÍLCHEZ'] },
    { date: '2026-01-22', time: '10:30-12:30', loc: 'LA BARBERA', people: ['ARACELI GARRIDO', 'TOÑI ESCANERO', 'ANABEL LLAMAS'] },
    { date: '2026-01-22', time: '17:30-19:30', loc: 'EL CENSAL', people: ['MÓNICA GONZÁLEZ', 'CARMINA JIMÉNEZ'] },
    { date: '2026-01-22', time: '17:30-19:30', loc: 'LA BARBERA', people: ['PAQUI LEAL', 'JORGE TORRES', 'ABIGAIL TORRES'] },
    { date: '2026-01-24', time: '10:30-12:00', loc: 'Dr. ESQUERDO', people: ['MISAEL GORDILLO', 'RAQUEL GORDILLO'] },
    { date: '2026-01-24', time: '12:00-13:30', loc: 'Dr. ESQUERDO', people: ['JOSÉ RAMÓN ORQUIN', 'Mª CARMEN ORQUIN'] },
    { date: '2026-01-24', time: '10:30-12:00', loc: 'EL CENSAL', people: ['PATTY CRESCIMANNO', 'MARTA LUCIA MORALES'] },
    { date: '2026-01-24', time: '12:00-13:30', loc: 'EL CENSAL', people: ['JOSÉ CARNEIRO', 'KEVIN BALLESTER'] },
  ]
};