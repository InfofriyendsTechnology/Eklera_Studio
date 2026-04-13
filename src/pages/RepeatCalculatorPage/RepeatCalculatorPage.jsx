import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCheckCircle,
  HiXCircle,
  HiLightBulb,
  HiStar,
  HiChevronDown,
  HiCog6Tooth,
  HiShieldCheck,
  HiSparkles,
  HiPlus,
  HiTrash,
  HiXMark,
  HiArrowsPointingIn,
  HiArrowUp,
  HiArrowDown,
  HiArrowsRightLeft,
} from 'react-icons/hi2';
import { MdOutlineDesignServices } from 'react-icons/md';
import { TbRulerMeasure, TbArrowsMaximize } from 'react-icons/tb';
import Navbar from '../../components/Navbar/Navbar';
import styles from './RepeatCalculatorPage.module.scss';

// ─── Constants ─────────────────────────────────────────────────────────────────

const LS_KEY        = 'eklera_machine_sizes';
const DEFAULT_SIZES = [250, 300, 350, 400];

// ─── localStorage helpers ──────────────────────────────────────────────────────

function loadSizes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0)
        return [...new Set([...DEFAULT_SIZES, ...parsed.map(Number)])].sort((a, b) => a - b);
    }
  } catch {}
  return [...DEFAULT_SIZES];
}

function saveSizes(sizes) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(sizes)); } catch {}
}

// ─── Calculation logic ─────────────────────────────────────────────────────────

function roundnessScore(size) {
  if (size % 100 === 0) return 100;
  if (size % 50  === 0) return 90;
  if (size % 25  === 0) return 80;
  if (size % 10  === 0) return 70;
  if (size % 5   === 0) return 60;
  if (Number.isInteger(size)) return 50;
  if ((size * 10) % 1 === 0) return 40;
  if ((size * 100) % 1 === 0) return 30;
  return 10;
}

/**
 * Smart suggestions — 3-tier algorithm.
 *
 * TIER 1 (very nearby ±2% or ±1.5mm): Pure proximity — sorted by mmDiff ASC.
 *   → e.g. 62.5mm beats 50mm when input = 62.02mm (0.48mm away vs 12mm away)
 *
 * TIER 2 (nearby ±25mm or ±25%): Proximity first, roundness as tiebreaker.
 *   → e.g. 62.5mm (5.5mm away) beats 50mm (7mm away) when input = 57mm ✓
 *   → nearest perfect fit is always recommended first
 *
 * TIER 3 (farther): Roundness first (these are "alternative" options).
 */
function generateSuggestions(machineSize, inputDesignSize) {
  const maxRepeats        = Math.min(100, Math.floor(machineSize / 5));
  const veryNearThreshold = Math.max(1.5, inputDesignSize * 0.02);  // ±2%
  const nearbyThreshold   = Math.max(25,  inputDesignSize * 0.25);  // ±25%

  const veryNearby = [];
  const nearby     = [];
  const farAway    = [];

  for (let r = 2; r <= maxRepeats; r++) {
    const ds = machineSize / r;
    if (ds < 1) break;
    const item = {
      repeats:     r,
      designSize:  +ds.toFixed(4),
      displaySize: ds % 1 === 0 ? ds : +ds.toFixed(2),
      roundScore:  roundnessScore(ds),
      mmDiff:      Math.abs(ds - inputDesignSize),
    };
    if (item.mmDiff <= veryNearThreshold)   veryNearby.push(item);
    else if (item.mmDiff <= nearbyThreshold) nearby.push(item);
    else                                     farAway.push(item);
  }

  // Tier 1: pure proximity
  veryNearby.sort((a, b) => a.mmDiff - b.mmDiff);

  // Tier 2: proximity FIRST — nearest perfect fit wins, roundness only breaks ties
  nearby.sort((a, b) => a.mmDiff - b.mmDiff || b.roundScore - a.roundScore);

  // Tier 3: farther options — roundness first (user picks from these consciously)
  farAway.sort((a, b) => b.roundScore - a.roundScore || a.mmDiff - b.mmDiff);

  return [...veryNearby, ...nearby, ...farAway].slice(0, 6);
}

function calcFromRepeats(machineSize, repeatCount) {
  if (!machineSize || !repeatCount || repeatCount <= 0) return null;
  const ds = machineSize / repeatCount;
  return { designSize: +ds.toFixed(4), displaySize: ds % 1 === 0 ? ds : +ds.toFixed(2), repeats: repeatCount, isPerfect: true };
}

function calcFromDesignSize(machineSize, designSize) {
  if (!machineSize || !designSize || designSize <= 0) return null;
  const repeats   = machineSize / designSize;
  const isPerfect = Math.abs(repeats - Math.round(repeats)) < 0.001;
  return {
    repeats: +repeats.toFixed(4),
    displayRepeats: +repeats.toFixed(2),
    isPerfect,
    suggestions: generateSuggestions(machineSize, designSize),
    machineSize,
    designSize,
  };
}

/**
 * Mode 3 — Resize Suggestion
 * Find all perfect-fit target repeats near currentRepeat and compute
 * what the New Width would be for each.
 * Formula: newWidth = currentWidth × (targetRepeat / currentRepeat)
 */
function calcResize(machineSize, currentWidth, currentRepeat) {
  if (!machineSize || !currentWidth || !currentRepeat) return null;
  if (currentWidth <= 0 || currentRepeat <= 0) return null;

  // Check if current repeat already fits
  const currentFitCount = machineSize / currentRepeat;
  const isAlreadyPerfect = Math.abs(currentFitCount - Math.round(currentFitCount)) < 0.001;

  // Generate all perfect target repeats for this machine size
  const maxRepeats = Math.min(100, Math.floor(machineSize / 5));
  const options    = [];

  for (let r = 2; r <= maxRepeats; r++) {
    const targetRepeat  = machineSize / r;
    if (targetRepeat < 1) break;

    const newWidth      = currentWidth * (targetRepeat / currentRepeat);
    const diff          = +(newWidth - currentWidth).toFixed(2);
    const absDiff       = Math.abs(diff);
    const pct           = +((diff / currentWidth) * 100).toFixed(2);
    const rScore        = roundnessScore(targetRepeat);

    options.push({
      repeats:       r,
      targetRepeat:  +targetRepeat.toFixed(4),
      displayRepeat: targetRepeat % 1 === 0 ? targetRepeat : +targetRepeat.toFixed(2),
      newWidth:      +newWidth.toFixed(2),
      diff,
      absDiff,
      pct,
      direction:     diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'none',
      roundScore:    rScore,
    });
  }

  // Sort: smallest absolute difference first (minimal resize needed), then roundness
  options.sort((a, b) => a.absDiff - b.absDiff || b.roundScore - a.roundScore);

  return {
    isAlreadyPerfect,
    currentFitCount: +currentFitCount.toFixed(3),
    options: options.slice(0, 5),
  };
}

// ─── Animation variants ────────────────────────────────────────────────────────

const fadeUp  = {
  hidden:  { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.18 } },
};
const stagger     = { visible: { transition: { staggerChildren: 0.07 } } };
const staggerItem = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } } };

// ─── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className={styles.sectionLabel}>
      <Icon size={13} /><span>{label}</span>
    </div>
  );
}

// ─── Add Machine Size Modal ───────────────────────────────────────────────────

function AddSizeModal({ onAdd, onClose, existingSizes }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const inputRef      = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const handleAdd = () => {
    const num = parseFloat(val);
    if (!num || num <= 0 || num > 9999) { setErr('1 – 9999 mm valid size aapo'); return; }
    if (existingSizes.includes(num))    { setErr(`${num} mm already chhe`); return; }
    onAdd(num);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  handleAdd();
    if (e.key === 'Escape') onClose();
  };

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className={styles.modal}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0   }}
        exit={{    opacity: 0, scale: 0.88, y: 24   }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}><HiPlus size={18} />New Machine Size Add Karo</div>
          <button className={styles.modalClose} onClick={onClose}><HiXMark size={20} /></button>
        </div>
        <div className={styles.modalBody}>
          <label htmlFor="modal-size-input" className={styles.modalLabel}>Size (mm)</label>
          <div className={styles.modalInputWrap}>
            <input ref={inputRef} id="modal-size-input" type="number" className={styles.modalInput}
              placeholder="e.g. 500" min="1" max="9999" step="1"
              value={val} onChange={(e) => { setVal(e.target.value); setErr(''); }} onKeyDown={handleKey}
            />
            <span className={styles.modalInputUnit}>mm</span>
          </div>
          <AnimatePresence>
            {err && (
              <motion.p className={styles.modalError}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {err}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
          <motion.button className={styles.modalAddBtn} onClick={handleAdd} disabled={!val}
            whileHover={val ? { scale: 1.03 } : {}} whileTap={val ? { scale: 0.96 } : {}}>
            <HiPlus size={16} /> Add Size
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Custom Machine Dropdown ──────────────────────────────────────────────────

function MachineDropdown({ sizes, value, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (s) => { onChange(s); setOpen(false); };

  return (
    <div className={styles.customDropdown} ref={ref}>
      <button type="button" id="machine-dropdown-trigger"
        className={`${styles.dropdownTrigger} ${open ? styles.dropdownTriggerOpen : ''}`}
        onClick={() => setOpen((p) => !p)} aria-haspopup="listbox" aria-expanded={open}
      >
        <span className={styles.dropdownValue}>{value} mm</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className={styles.dropdownChevron}>
          <HiChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul className={styles.dropdownPanel} role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -8, scale: 0.97  }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {sizes.map((s) => {
              const isDefault  = DEFAULT_SIZES.includes(s);
              const isSelected = s === value;
              return (
                <li key={s} role="option" aria-selected={isSelected}
                  className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionActive : ''}`}>
                  <button type="button" className={styles.dropdownOptionBtn} onClick={() => select(s)}>
                    {s} mm
                    {isDefault && <span className={styles.defaultTag}>Default</span>}
                  </button>
                  {!isDefault && (
                    <button type="button" className={styles.dropdownDeleteBtn}
                      onClick={(e) => { e.stopPropagation(); onDelete(s); setOpen(false); }}
                      title={`Delete ${s} mm`} aria-label={`Delete ${s} mm`}>
                      <HiTrash size={14} />
                    </button>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RepeatCalculatorPage() {
  const [machineSizes, setMachineSizes] = useState(loadSizes);
  const [machineSize,  setMachineSize]  = useState(() => loadSizes()[0] || 250);
  const [showModal,    setShowModal]    = useState(false);

  // Mode 1 & 2
  const [mode,        setMode]        = useState(1);
  const [repeatCount, setRepeatCount] = useState('');
  const [designSize,  setDesignSize]  = useState('');
  const [result,      setResult]      = useState(null);

  // Mode 3 — Resize
  const [curWidth,  setCurWidth]  = useState('');
  const [curRepeat, setCurRepeat] = useState('');
  const [resizeResult, setResizeResult] = useState(null);

  useEffect(() => { saveSizes(machineSizes); }, [machineSizes]);

  // Auto-calc modes 1 & 2
  useEffect(() => {
    if (mode === 1) {
      const rc = parseFloat(repeatCount);
      setResult(rc > 0 ? calcFromRepeats(machineSize, rc) : null);
    } else if (mode === 2) {
      const ds = parseFloat(designSize);
      setResult(ds > 0 ? calcFromDesignSize(machineSize, ds) : null);
    }
  }, [mode, machineSize, repeatCount, designSize]);

  // Auto-calc mode 3
  useEffect(() => {
    if (mode === 3) {
      const w  = parseFloat(curWidth);
      const cr = parseFloat(curRepeat);
      setResizeResult(calcResize(machineSize, w, cr));
    }
  }, [mode, machineSize, curWidth, curRepeat]);

  const handleAddSize = useCallback((num) => {
    const updated = [...new Set([...machineSizes, num])].sort((a, b) => a - b);
    setMachineSizes(updated);
    setMachineSize(num);
    setShowModal(false);
  }, [machineSizes]);

  const handleDeleteSize = useCallback((size) => {
    if (DEFAULT_SIZES.includes(size)) return;
    const updated = machineSizes.filter((s) => s !== size);
    setMachineSizes(updated);
    if (machineSize === size) setMachineSize(updated[0]);
  }, [machineSizes, machineSize]);

  const handleModeChange = useCallback((m) => {
    setMode(m);
    setRepeatCount(''); setDesignSize('');
    setCurWidth(''); setCurRepeat('');
    setResult(null); setResizeResult(null);
  }, []);

  const hasInput = mode === 1 ? !!repeatCount
                 : mode === 2 ? !!designSize
                 : (!!curWidth && !!curRepeat);

  // Mode 3 tab indicator position
  const indicatorX = mode === 1 ? 0 : mode === 2 ? '100%' : '200%';

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>

        {/* Hero */}
        <motion.section className={styles.hero}
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className={styles.heroBadge}>
            <HiSparkles size={11} /><span>Smart Embroidery Calculator</span>
          </div>
          <h1 className={styles.heroTitle}>
            Perfect Fit, <span className={styles.heroAccent}>Every Time</span>
          </h1>
          <p className={styles.heroSubtitle}>Machine size aapo — Eklera Studio perfect repeat bataavse</p>
        </motion.section>

        {/* Mode Tabs — 3 tabs */}
        <motion.div className={styles.modeTabs}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.1 }}>
          <motion.div className={styles.modeIndicator}
            animate={{ x: indicatorX }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }} />

          <button id="mode-tab-1" className={`${styles.modeTab} ${mode === 1 ? styles.modeTabActive : ''}`} onClick={() => handleModeChange(1)}>
            <MdOutlineDesignServices size={15} /><span>Design Size</span>
          </button>
          <button id="mode-tab-2" className={`${styles.modeTab} ${mode === 2 ? styles.modeTabActive : ''}`} onClick={() => handleModeChange(2)}>
            <TbRulerMeasure size={15} /><span>Check Fit</span>
          </button>
          <button id="mode-tab-3" className={`${styles.modeTab} ${mode === 3 ? styles.modeTabActive : ''}`} onClick={() => handleModeChange(3)}>
            <TbArrowsMaximize size={15} /><span>Resize</span>
          </button>
        </motion.div>

        {/* Combined Input Card */}
        <AnimatePresence mode="wait">
          <motion.div key={`mode-${mode}`} className={styles.inputCard} variants={fadeUp} initial="hidden" animate="visible" exit="exit">

            {/* Machine Size Row */}
            <div className={styles.machineRow}>
              <label className={styles.machineLabel} htmlFor="machine-dropdown-trigger">
                <HiCog6Tooth size={14} /> Machine Size
              </label>
              <div className={styles.machineRowControls}>
                <MachineDropdown sizes={machineSizes} value={machineSize} onChange={setMachineSize} onDelete={handleDeleteSize} />
                <motion.button id="add-size-modal-btn" className={styles.addBtn}
                  onClick={() => setShowModal(true)}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  title="Add new machine size" aria-label="Add new machine size">
                  <HiPlus size={18} />
                </motion.button>
              </div>
            </div>

            <div className={styles.cardDivider} />

            {/* Mode 1 — Find Design Size */}
            {mode === 1 && (
              <div className={styles.inputGroup}>
                <label htmlFor="repeat-count-input" className={styles.inputLabel}>
                  <MdOutlineDesignServices size={14} /> Repeat Count
                </label>
                <div className={styles.inputWrap}>
                  <input id="repeat-count-input" type="number" placeholder="e.g. 4" min="1" step="1"
                    value={repeatCount} onChange={(e) => setRepeatCount(e.target.value)} autoFocus />
                  <span className={styles.inputUnit}>×</span>
                </div>
              </div>
            )}

            {/* Mode 2 — Check Fit */}
            {mode === 2 && (
              <div className={styles.inputGroup}>
                <label htmlFor="design-size-input" className={styles.inputLabel}>
                  <TbRulerMeasure size={14} /> Design Size
                </label>
                <div className={styles.inputWrap}>
                  <input id="design-size-input" type="number" placeholder="e.g. 64" min="0.1" step="0.1"
                    value={designSize} onChange={(e) => setDesignSize(e.target.value)} autoFocus />
                  <span className={styles.inputUnit}>mm</span>
                </div>
              </div>
            )}

            {/* Mode 3 — Resize */}
            {mode === 3 && (
              <div className={styles.resizeInputs}>
                <div className={styles.inputGroup}>
                  <label htmlFor="cur-width-input" className={styles.inputLabel}>
                    <HiArrowsRightLeft size={14} /> Current Design Width
                  </label>
                  <div className={styles.inputWrap}>
                    <input id="cur-width-input" type="number" placeholder="e.g. 312.04" min="0.1" step="0.01"
                      value={curWidth} onChange={(e) => setCurWidth(e.target.value)} autoFocus />
                    <span className={styles.inputUnit}>mm</span>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="cur-repeat-input" className={styles.inputLabel}>
                    <TbArrowsMaximize size={14} /> Current Repeat
                  </label>
                  <div className={styles.inputWrap}>
                    <input id="cur-repeat-input" type="number" placeholder="e.g. 62.16" min="0.1" step="0.01"
                      value={curRepeat} onChange={(e) => setCurRepeat(e.target.value)} />
                    <span className={styles.inputUnit}>mm</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Results modes 1 & 2 ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {result && hasInput && (mode === 1 || mode === 2) && (
            <motion.div key={`result-${mode}-${machineSize}`}
              className={styles.resultsArea} variants={stagger} initial="hidden" animate="visible" exit="exit">

              <motion.div variants={staggerItem}>
                <SectionLabel icon={HiShieldCheck} label="Result" />
                <div className={`${styles.resultCard} ${result.isPerfect ? styles.success : styles.error}`}>
                  <div className={styles.resultMain}>
                    <div className={`${styles.resultIconBox} ${result.isPerfect ? styles.successIcon : styles.errorIcon}`}>
                      {result.isPerfect ? <HiCheckCircle size={24} /> : <HiXCircle size={24} />}
                    </div>
                    <div className={styles.resultInfo}>
                      {mode === 1 ? (
                        <>
                          <div className={styles.resultLabel}>Design Size per Repeat</div>
                          <div className={styles.resultBigValue}>{result.displaySize}<span className={styles.resultUnit}>mm</span></div>
                          <div className={styles.resultFormula}>{machineSize} mm ÷ {result.repeats} = {result.displaySize} mm</div>
                        </>
                      ) : (
                        <>
                          <div className={styles.resultLabel}>Actual Repeats</div>
                          <div className={styles.resultBigValue}>{result.displayRepeats}<span className={styles.resultUnit}>×</span></div>
                          <div className={styles.resultFormula}>{machineSize} mm ÷ {result.designSize} mm = {result.displayRepeats}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <SectionLabel icon={result.isPerfect ? HiCheckCircle : HiXCircle} label="Status" />
                {result.isPerfect ? (
                  <div className={`${styles.statusPill} ${styles.statusPillSuccess}`}>
                    <HiCheckCircle size={18} />
                    <div><strong>Perfect Fit!</strong><span>No gap · No cut · Design perfectly repeats</span></div>
                  </div>
                ) : (
                  <div className={`${styles.statusPill} ${styles.statusPillError}`}>
                    <HiXCircle size={18} />
                    <div><strong>Not Fit</strong><span>{result.displayRepeats}× repeats — decimal chhe, cut thase</span></div>
                  </div>
                )}
              </motion.div>

              {mode === 2 && result.suggestions?.length > 0 && (
                <motion.div variants={staggerItem}>
                  <SectionLabel icon={HiLightBulb} label="Perfect Suggestions" />
                  <motion.div className={styles.suggestGrid} variants={stagger} initial="hidden" animate="visible">
                    {result.suggestions.map((s, i) => (
                      <motion.div key={s.repeats}
                        className={`${styles.suggestItem} ${i === 0 ? styles.recommended : ''}`}
                        variants={staggerItem} whileHover={{ scale: 1.04, y: -3 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 22 }}>
                        {i === 0 && <div className={styles.recommendedBadge}><HiStar size={10} /> Recommended</div>}
                        <div className={styles.suggestSize}>{s.displaySize} mm</div>
                        <div className={styles.suggestRepeats}>{s.repeats} repeats</div>
                        <div className={styles.suggestFit}>✓ Perfect</div>
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className={styles.suggestNote}><HiLightBulb size={12} /> Upar na koi pan size use karo — perfectly fit thase</p>
                </motion.div>
              )}

              {mode === 1 && result.isPerfect && (
                <motion.div variants={staggerItem} className={styles.fitChips}>
                  <span className={styles.fitChip}><HiCheckCircle size={12} /> No Gap</span>
                  <span className={styles.fitChip}><HiCheckCircle size={12} /> No Cut</span>
                  <span className={styles.fitChip}><HiCheckCircle size={12} /> Perfect Repeat</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result Mode 3 — Resize ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {resizeResult && hasInput && mode === 3 && (
            <motion.div key="resize-result"
              className={styles.resultsArea} variants={stagger} initial="hidden" animate="visible" exit="exit">

              {/* Current status */}
              <motion.div variants={staggerItem}>
                <SectionLabel icon={HiShieldCheck} label="Current Status" />
                {resizeResult.isAlreadyPerfect ? (
                  <div className={`${styles.statusPill} ${styles.statusPillSuccess}`}>
                    <HiCheckCircle size={18} />
                    <div>
                      <strong>Already Perfect Fit!</strong>
                      <span>{curRepeat} mm × {Math.round(resizeResult.currentFitCount)} = {machineSize} mm</span>
                    </div>
                  </div>
                ) : (
                  <div className={`${styles.statusPill} ${styles.statusPillError}`}>
                    <HiXCircle size={18} />
                    <div>
                      <strong>Not Perfect Fit</strong>
                      <span>{curRepeat} mm × {resizeResult.currentFitCount} = {machineSize} mm — decimal repeat</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Resize options */}
              <motion.div variants={staggerItem}>
                <SectionLabel icon={TbArrowsMaximize} label="Resize Suggestions" />
                <motion.div className={styles.resizeGrid} variants={stagger} initial="hidden" animate="visible">
                  {resizeResult.options.map((opt, i) => (
                    <motion.div
                      key={opt.repeats}
                      className={`${styles.resizeCard} ${i === 0 ? styles.resizeCardTop : ''}`}
                      variants={staggerItem}
                      whileHover={{ scale: 1.02, y: -3 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    >
                      {i === 0 && (
                        <div className={styles.recommendedBadge}>
                          <HiStar size={10} /> Recommended
                        </div>
                      )}

                      {/* New width — big highlight */}
                      <div className={styles.resizeNewWidth}>
                        <span className={styles.resizeNewWidthLabel}>Resize to</span>
                        <span className={styles.resizeNewWidthValue}>
                          {opt.newWidth} <span className={styles.resizeUnit}>mm</span>
                        </span>
                      </div>

                      {/* Change indicator */}
                      <div className={`${styles.resizeDiff} ${opt.direction === 'increase' ? styles.resizeDiffUp : opt.direction === 'decrease' ? styles.resizeDiffDown : styles.resizeDiffNone}`}>
                        {opt.direction === 'increase' && <HiArrowUp size={13} />}
                        {opt.direction === 'decrease' && <HiArrowDown size={13} />}
                        <span>
                          {opt.direction === 'increase' ? '+' : ''}{opt.diff} mm
                          &nbsp;({opt.direction === 'increase' ? '+' : ''}{opt.pct}%)
                        </span>
                      </div>

                      {/* Details */}
                      <div className={styles.resizeDetails}>
                        <span className={styles.resizeRepeatTarget}>{opt.displayRepeat} mm × {opt.repeats}</span>
                        <span className={styles.resizePerfect}>= {machineSize} mm ✓</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <p className={styles.suggestNote}>
                  <HiLightBulb size={12} />
                  Design software ma width change karo ane repeat auto-adjust thase
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle info cards */}
        <AnimatePresence>
          {!hasInput && (
            <motion.div className={styles.infoCards}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, delay: 0.22 }}>
              {[
                { Icon: HiCog6Tooth,       color: 'pink',  title: 'Auto Calculate',    desc: 'Type karo ane result instantly milse' },
                { Icon: HiShieldCheck,     color: 'green', title: 'Perfect Fit Only',  desc: 'No gap, no cut — guaranteed repeat'  },
                { Icon: TbArrowsMaximize,  color: 'blue',  title: 'Resize Assistant',  desc: 'Exact resize mm ane % instantly milse' },
              ].map(({ Icon, color, title, desc }, i) => (
                <motion.div key={i} className={styles.infoCard}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 + i * 0.1, duration: 0.38 }}
                  whileHover={{ y: -5, scale: 1.02 }}>
                  <div className={`${styles.infoIconWrap} ${styles[`infoIcon--${color}`]}`}><Icon size={19} /></div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Eklera Studio · Smart Embroidery Tools</p>
      </footer>

      <AnimatePresence>
        {showModal && (
          <AddSizeModal onAdd={handleAddSize} onClose={() => setShowModal(false)} existingSizes={machineSizes} />
        )}
      </AnimatePresence>
    </div>
  );
}
