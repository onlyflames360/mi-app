
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Shift, Location, User, Assignment } from '../types';

export const generateShiftsPDF = (
  shifts: Shift[],
  locations: Location[],
  users: User[],
  assignments: Assignment[],
  monthLabel: string = "Enero 2026"
) => {
  const doc = new jsPDF() as any;
  
  doc.setFontSize(18);
  doc.text(`PPOC - Planificación de Turnos - ${monthLabel}`, 14, 22);
  
  const tableData = [...shifts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(shift => {
      const location = locations.find(l => l.id === shift.location_id);
      const shiftAssignments = assignments.filter(a => a.shift_id === shift.id);
      const assignedUserNames = shiftAssignments.map(a => {
        const user = users.find(u => u.id === a.user_id);
        return user?.display_name || 'Desconocido';
      }).join(', ');
      
      return [
        shift.date,
        `${shift.start_time} - ${shift.end_time}`,
        location?.name || '?',
        assignedUserNames
      ];
    });

  if (tableData.length === 0) {
    return;
  }

  doc.autoTable({
    startY: 30,
    head: [['Fecha', 'Horario', 'Ubicación', 'Voluntarios']],
    body: tableData,
    headStyles: { fillColor: [30, 136, 229] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 30 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 40 },
    }
  });

  const fileName = `PPOC_Turnos_${monthLabel.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
