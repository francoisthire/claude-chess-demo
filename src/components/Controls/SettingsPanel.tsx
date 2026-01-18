import { useSettingsStore } from '../../store/settingsStore';
import { playSound, initAudio } from '../../utils/sounds';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    soundEnabled,
    showCoordinates,
    animationSpeed,
    highlightMoves,
    setSoundEnabled,
    setShowCoordinates,
    setAnimationSpeed,
    setHighlightMoves,
  } = useSettingsStore();

  if (!isOpen) return null;

  const handleSoundToggle = (enabled: boolean) => {
    if (enabled) {
      initAudio();
      playSound('move');
    }
    setSoundEnabled(enabled);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Paramètres</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Audio</h3>
            <ToggleSetting
              label="Effets sonores"
              description="Jouer des sons pour les coups et événements"
              value={soundEnabled}
              onChange={handleSoundToggle}
            />
          </div>

          <div className={styles.section}>
            <h3>Affichage</h3>
            <ToggleSetting
              label="Coordonnées"
              description="Afficher les lettres et chiffres sur le plateau"
              value={showCoordinates}
              onChange={setShowCoordinates}
            />
            <ToggleSetting
              label="Surbrillance des coups"
              description="Montrer les coups légaux et le dernier coup"
              value={highlightMoves}
              onChange={setHighlightMoves}
            />
          </div>

          <div className={styles.section}>
            <h3>Animations</h3>
            <div className={styles.setting}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Vitesse d'animation</span>
              </div>
              <div className={styles.speedButtons}>
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    className={`${styles.speedButton} ${animationSpeed === speed ? styles.active : ''}`}
                    onClick={() => setAnimationSpeed(speed)}
                  >
                    {speed === 'slow' ? 'Lent' : speed === 'normal' ? 'Normal' : 'Rapide'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>Les paramètres sont sauvegardés automatiquement</p>
        </div>
      </div>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSetting({ label, description, value, onChange }: ToggleSettingProps) {
  return (
    <div className={styles.setting}>
      <div className={styles.settingInfo}>
        <span className={styles.settingLabel}>{label}</span>
        <span className={styles.settingDescription}>{description}</span>
      </div>
      <button
        className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
