'use client';
import { useState, useEffect } from 'react';
import { FiSend, FiX, FiPlus, FiMail, FiUsers, FiCheck } from 'react-icons/fi';
import { apiCall } from '@/lib/backendFetch';
// ─── Reusable chip email input
function EmailChipInput({ emails, setEmails, placeholder = 'Type here...' }) {
  const [input, setInput] = useState('');

  const commit = (raw) => {
    const parsed = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
    if (parsed.length) setEmails((prev) => [...new Set([...prev, ...parsed])]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) commit(input);
    }
    if (e.key === 'Backspace' && !input && emails.length) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="bg-dark-bg rounded-lg px-3 py-2 min-h-12 flex flex-wrap gap-2 items-center cursor-text">
      {emails.map((email) => (
        <span
          key={email}
          className="flex items-center gap-1 bg-primary/20 border border-primary/30 text-primary text-xs px-2.5 py-1 rounded-full"
        >
          {email}
          <button
            type="button"
            onClick={() => setEmails((prev) => prev.filter((e) => e !== email))}
            className="hover:text-red-400 transition-colors"
          >
            <FiX className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input.trim() && commit(input)}
        placeholder={emails.length === 0 ? placeholder : 'Add more…'}
        className="flex-1 min-w-[180px] bg-transparent text-sm text-text-main placeholder-text-secondary outline-none"
      />
    </div>
  );
}

// ─── Toggle switch ───────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
  type="button"
  onClick={() => onChange(!value)}
  className={`relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-3 focus:ring-offset-dark-bg ${
    value
      ? 'bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
      : 'bg-dark-bg border border-primary'
  }`}
>
  {/* Track shimmer effect */}
  {value && (
    <span className="absolute inset-0 rounded-full overflow-hidden">
      <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </span>
  )}

  {/* Thumb */}
  <span
    className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center justify-center
      ${value
        ? 'translate-x-6 bg-white scale-90'
        : 'translate-x-0.5 bg-primary/80 scale-100'
      }`}
  >
    {/* Inner dot */}
    <span
      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
        value ? 'bg-primary scale-100' : 'bg-white/60 scale-75'
      }`}
    />
  </span>
</button>
  );
}

// ─── Pill button (selectable) ────────────────────────────────────────────────
function Pill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full border transition-all duration-150 ${
        selected
          ? 'bg-primary text-dark-bg border-primary font-medium'
          : 'border-primary/25 text-text-secondary hover:border-primary hover:text-primary'
      }`}
    >
      {selected && <FiCheck className="w-3 h-3" />}
      {label}
    </button>
  );
}

// ─── Single group slot card ──────────────────────────────────────────────────
function GroupSlot({ slot, idx, dashboard, takenRoles, onRoleSet, onToggleDept, onToggleYear, onRemove }) {
  const availableRoles = ['teacher', 'student'].filter(
    (r) => !takenRoles.filter((_, i) => i !== idx).includes(r)
  );

  const deptOptions =
    slot.role === 'teacher'
      ? dashboard?.teacher ?? []
      : dashboard?.student?.department ?? [];

  const yearOptions = dashboard?.student?.years ?? [];

  return (
    <div className="relative bg-dark-bg rounded-xl p-4 space-y-3 border border-primary/10">
      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(idx)}
        className="absolute top-3 right-3 text-text-secondary hover:text-red-400 transition-colors"
      >
        <FiX />
      </button>

      {/* Role picker */}
      {!slot.role ? (
        <div className="space-y-2 pr-6">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Select group type</p>
          <div className="flex gap-2">
            {availableRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onRoleSet(idx, role)}
                className="px-5 py-1.5 border border-primary/40 rounded-lg text-primary text-sm capitalize hover:bg-primary/10 transition"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 pr-6">
          {/* Role label */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary capitalize">{slot.role}</span>
            <span className="text-xs text-text-secondary">
              — empty selection means <em>all</em>
            </span>
          </div>

          {/* Departments */}
          <div className="space-y-1.5">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Departments</p>
            <div className="flex flex-wrap gap-2">
              {deptOptions.map((dept) => (
                <Pill
                  key={dept}
                  label={dept}
                  selected={slot.departments.includes(dept)}
                  onClick={() => onToggleDept(idx, dept)}
                />
              ))}
            </div>
          </div>

          {/* Years (student only) */}
          {slot.role === 'student' && (
            <div className="space-y-1.5">
              <p className="text-xs text-text-secondary uppercase tracking-wider">Years</p>
              <div className="flex flex-wrap gap-2">
                {yearOptions.map((year) => (
                  <Pill
                    key={year}
                    label={year}
                    selected={slot.years.includes(year)}
                    onClick={() => onToggleYear(idx, year)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

//Main page
export default function MessagesPage() {
  const [tab, setTab] = useState('individual');

  // Individual state
  const [indEmails, setIndEmails] = useState([]);

  // Group state
  const [dashboard, setDashboard] = useState(null);
  const [groups, setGroups] = useState([]); // [{role, departments:[], years:[]}]
  const [wantIndividual, setWantIndividual] = useState(null); // null | true | false
  const [extraEmails, setExtraEmails] = useState([]);

  // Common
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [canReply, setCanReply] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch dashboard on mount
useEffect(() => {
  apiCall('/msg_dashboard', { method: 'GET' })
    .then(data => { 
      setDashboard(data?.groups || null);
    })
    .catch(err => console.error(err));
}, []); 

useEffect(() => {
  // Reset everything when tab changes
  setIndEmails([]);
  setGroups([]);
  setWantIndividual(null);
  setExtraEmails([]);
  setSubject('');
  setMessage('');
  setCanReply(true);
  setError('');
}, [tab]);
  //Group helpers
  const takenRoles = groups.map((g) => g.role);

  const canAddMore =
    groups.length < 2 &&
    !groups.some((g) => !g.role) &&
    !(takenRoles.includes('teacher') && takenRoles.includes('student'));

  const addGroupSlot = () => {
    // Auto-assign role when the other is already taken
    let defaultRole = '';
    if (takenRoles.includes('teacher') && !takenRoles.includes('student')) defaultRole = 'student';
    if (takenRoles.includes('student') && !takenRoles.includes('teacher')) defaultRole = 'teacher';
    setGroups((prev) => [...prev, { role: defaultRole, departments: [], years: [] }]);
  };

  const setGroupRole = (idx, role) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === idx ? { role, departments: [], years: [] } : g))
    );
  };

  const toggleDept = (idx, dept) => {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== idx) return g;
        const deps = g.departments.includes(dept)
          ? g.departments.filter((d) => d !== dept)
          : [...g.departments, dept];
        return { ...g, departments: deps };
      })
    );
  };

  const toggleYear = (idx, year) => {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== idx) return g;
        const yrs = g.years.includes(year)
          ? g.years.filter((y) => y !== year)
          : [...g.years, year];
        return { ...g, years: yrs };
      })
    );
  };

  const removeGroup = (idx) => setGroups((prev) => prev.filter((_, i) => i !== idx));

  // ── Build payload ──────────────────────────────────────────────────────────
  const buildPayload = () => {
    if (tab === 'individual') {
      return {
        receiver: indEmails,
        can_Reply: canReply,
        group: null,
        message,
        subject,
      };
    }

    const groupObj = {};
    for (const g of groups) {
      if (!g.role) continue;
      if (g.role === 'teacher') {
        groupObj.teacher = g.departments.length ? g.departments : null;
      } else if (g.role === 'student') {
        groupObj.student = { department: g.departments, year: g.years };
      }
    }

    return {
      receiver: wantIndividual ? extraEmails : [],
      can_Reply: canReply,
      group: Object.keys(groupObj).length ? groupObj : null,
      message,
      subject,
    };
  };

  // ── Send ───────────────────────────────────────────────────────────────────
 const handleSend = async () => {
  setError('');

  if (!subject.trim() || !message.trim()) {
    setError('Subject and message are required.');
    return;
  }

  if (tab === 'individual' && indEmails.length === 0) {
    setError('Add at least one recipient email.');
    return;
  }

  if (tab === 'group' && groups.every(g => !g.role)) {
  setError('Select at least one valid group.');
  return;
}
  const payload = buildPayload();

  console.log("Sending Payload:", payload);
  setLoading(true);

  try {
    const data = await apiCall('/send_message', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Reset state
    setIndEmails([]);
    setGroups([]);
    setWantIndividual(null);
    setExtraEmails([]);
    setSubject('');
    setMessage('');
    setCanReply(true);

    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);

  } catch (err) {
    setError(err.message || "Failed to send. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // Shared input style
  const inputCls =
    'w-full bg-dark-bg rounded-lg px-4 py-2.5 text-sm text-text-main placeholder-text-secondary outline-none focus:ring-1 focus:ring-primary transition';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <h1 className="text-2xl font-bold text-text-main">Send Message</h1>

      {/* Tab toggle */}
      <div className="flex bg-dark-bg rounded-xl p-1 gap-1 w-fit">
        {[
          { id: 'individual', icon: FiMail, label: 'Individual' },
          { id: 'group', icon: FiUsers, label: 'Group' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === id
                ? 'bg-primary text-dark-bg shadow-md'
                : 'text-text-secondary hover:text-text-main'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-card-bg rounded-2xl p-6 space-y-5">

        {/*INDIVIDUAL TAB*/}
        {tab === 'individual' && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Recipients
            </label>
            <EmailChipInput emails={indEmails} setEmails={setIndEmails} />
            <p className="text-xs text-text-secondary pl-1">
              Press <kbd className="bg-dark-bg px-1 rounded text-primary text-xs">Enter</kbd> or{' '}
              <kbd className="bg-dark-bg px-1 rounded text-primary text-xs">,</kbd> to add each email
            </p>
          </div>
        )}

        {/*GROUP TAB*/}
        {tab === 'group' && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Recipient Groups
            </label>

            {/* Group slots */}
            {groups.map((slot, idx) => (
              <GroupSlot
                key={idx}
                slot={slot}
                idx={idx}
                dashboard={dashboard}
                takenRoles={takenRoles}
                onRoleSet={setGroupRole}
                onToggleDept={toggleDept}
                onToggleYear={toggleYear}
                onRemove={removeGroup}
              />
            ))}

            {/* Add group button */}
            {canAddMore && (
              <button
                type="button"
                onClick={addGroupSlot}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-primary/30 rounded-xl text-primary text-sm hover:bg-primary/5 transition"
              >
                <FiPlus className="w-4 h-4" />
                {groups.length === 0 ? 'Add Group' : 'Add Another Group'}
              </button>
            )}

            {/* Individual emails option (shown once at least one group is added) */}
            {groups.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-text-secondary">
                    Also add specific individual emails?
                  </p>
                  <div className="flex gap-2">
                    {[
                      { val: true, label: 'Yes' },
                      { val: false, label: 'No' },
                    ].map(({ val, label }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setWantIndividual(val)}
                        className={`px-4 py-1 text-sm rounded-lg border transition ${
                          wantIndividual === val
                            ? 'bg-primary text-dark-bg border-primary'
                            : 'border-primary/25 text-text-secondary hover:border-primary hover:text-primary'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {wantIndividual && (
                    <>                <EmailChipInput
                                      emails={extraEmails}
                                      setEmails={setExtraEmails}
                                      placeholder="Type here..." /><p className="text-xs text-text-secondary pl-1">
                                          Press <kbd className="bg-dark-bg px-1 rounded text-primary text-xs">Enter</kbd> or{' '}
                                          <kbd className="bg-dark-bg px-1 rounded text-primary text-xs">,</kbd> to add each email
                                      </p></>
                )}
              </div>
            )}
          </div>
        )}

        {/*COMMON FIELDS */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Message
          </label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here…"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Can reply + Send */}
        <div className="flex items-center justify-between pt-1">
          {/* Can reply toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">Allow replies</span>
            <Toggle value={canReply} onChange={setCanReply} />
            <span className={`text-xs font-medium ${canReply ? 'text-primary' : 'text-text-secondary'}`}>
              {canReply ? 'On' : 'Off'}
            </span>
          </div>

          {/* Send button */}
          <button
  type="button"
  onClick={handleSend}
  disabled={
    loading ||
    !subject.trim() ||
    !message.trim() ||
    (tab === 'individual' && indEmails.length === 0) ||
    (tab === 'group' && groups.length === 0)
  }
  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-dark-bg text-sm font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
>
            {loading ? (
              <span className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
            ) : (
              <FiSend className="w-4 h-4" />
            )}
            {loading ? 'Sending…' : 'Send Message'}
          </button>
        </div>

        {/* Feedback messages */}
        {success && (
          <div className="flex items-center gap-2 text-green-400 text-sm justify-center bg-green-400/10 rounded-lg px-4 py-2.5">
            <FiCheck className="w-4 h-4" />
            Message sent successfully!
          </div>
        )}
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}