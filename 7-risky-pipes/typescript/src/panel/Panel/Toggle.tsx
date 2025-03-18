import { useState } from "react";
import "./Toggle.css";

export type ToggleProps = {
  onChange?: (willBeToggled: boolean) => void;
  size?: "large" | "medium" | "small" | "extra-small";
  toggled?: boolean;
  disabled?: boolean;
  label?: string;
};

export const Toggle = (
  {
    onChange,
    toggled = true,
    disabled = false,
    label = "Toggle",
  }: ToggleProps
) => {

  const [switchState, setSwitchState] = useState<boolean>(toggled);
  const handleToggle = (): void => {
    setSwitchState(!switchState);
    onChange?.(!toggled);
  };

  return (
    <div className="toggle-container">
      <button
        className="toggle"
        type="button"
        role="switch"
        aria-checked={toggled}
        onClick={handleToggle}
        aria-label={label}
        disabled={disabled}
      >
        <div className={switchState ? "switcher switcher-on" : "switcher switcher-off"}></div>
      </button>
      <span>{label}</span>
    </div>
  );
};
