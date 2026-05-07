// =============================================
//  schedule.js — Emploi du temps
// =============================================

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function renderSchedule() {
  const container = document.getElementById("schedule-grid");
  if (!container) return;

  const schedule = getData("edu_schedule");
  const subjects = getData("edu_subjects");
  const isAdmin = document.body.classList.contains("role-admin");

  container.innerHTML = DAYS.map((day) => {
    const slots = schedule
      .filter((s) => s.day === day)
      .sort((a, b) => a.start.localeCompare(b.start));

    const slotsHtml =
      slots.length === 0
        ? '<p style="padding:0.6rem 0.8rem;color:var(--text-muted);font-size:0.78rem;font-style:italic">Pas de cours</p>'
        : slots
            .map((slot) => {
              const subj = subjects.find((s) => s.id == slot.subjectId);
              return `
            <div class="schedule-slot">
              <span class="slot-time">${slot.start} → ${slot.end}</span>
              <span class="slot-subject">${subj ? subj.name : "–"}</span>
              ${isAdmin ? `<button class="btn-icon del" style="align-self:flex-end;margin-top:0.2rem" onclick="deleteScheduleSlot(${slot.id})"><i class="fas fa-trash"></i></button>` : ""}
            </div>
          `;
            })
            .join("");

    return `
      <div class="schedule-day">
        <div class="schedule-day-header">${day}</div>
        ${slotsHtml}
      </div>
    `;
  }).join("");
}

function openScheduleModal() {
  populateSubjectSelect("sched-subject");
  openModal("modal-schedule");
}

function saveSchedule() {
  const subjectId = document.getElementById("sched-subject")?.value;
  const day = document.getElementById("sched-day")?.value;
  const start = document.getElementById("sched-start")?.value;
  const end = document.getElementById("sched-end")?.value;

  if (!subjectId || !day || !start || !end) {
    showToast("Veuillez remplir tous les champs", "error");
    return;
  }
  if (start >= end) {
    showToast("L'heure de début doit être avant la fin", "error");
    return;
  }

  let schedule = getData("edu_schedule");
  schedule.push({ id: genId(), subjectId, day, start, end });
  saveData("edu_schedule", schedule);
  closeModal("modal-schedule");
  renderSchedule();
  showToast("Cours ajouté ✅");
}

function deleteScheduleSlot(id) {
  if (!confirmDelete("Supprimer ce cours ?")) return;
  let schedule = getData("edu_schedule");
  schedule = schedule.filter((s) => s.id !== id);
  saveData("edu_schedule", schedule);
  renderSchedule();
  showToast("Cours supprimé");
}
