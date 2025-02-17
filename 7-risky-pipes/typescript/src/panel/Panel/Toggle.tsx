/** @jsxImportSource theme-ui */
import { ThemeUIStyleObject } from "theme-ui";
import React from "react";

export type ToggleProps = {
  onChange?: (willBeToggled: boolean) => void;
  size?: "large" | "medium" | "small" | "extra-small";
  toggled?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    onChange,
    size = "medium",
    toggled = false,
    disabled = false,
    "aria-label": ariaLabel = "toggle"
  },
  ref
): JSX.Element {
  const sizes = {
    container: {
      large: {
        width: "3rem",
        height: "1.5rem"
      },
      medium: {
        width: "2.5rem",
        height: "1.25rem"
      },
      small: {
        width: "2rem",
        height: "1rem"
      },
      "extra-small": {
        width: "1.5rem",
        height: "0.75rem"
      }
    },
    switcher: {
      large: {
        size: "1rem",
        offsetOn: "1.75rem",
        offsetOff: "0.1875rem"
      },
      medium: {
        size: "0.75rem",
        offsetOn: "1.4375rem",
        offsetOff: "0.1875rem"
      },
      small: {
        size: "0.625rem",
        offsetOn: "1.125rem",
        offsetOff: "0.125rem"
      },
      "extra-small": {
        size: "0.5rem",
        offsetOn: "0.8125rem",
        offsetOff: "0.0625rem"
      }
    }
  };
  const toggleStyles: ThemeUIStyleObject = {
    padding: 0,
    margin: 0,
    outline: "none",
    background: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: disabled ? "grey.450" : "grey.350",
    borderRadius: "rounded",
    height: sizes.container[size].height,
    width: sizes.container[size].width,
    transition: `0.25s easy-in`,
    border: "1px solid transparent",
    "&:hover": {
      backgroundColor: disabled ? "grey.450" : "grey.300"
    },
    "&:focus-visible": {
      backgroundColor: disabled ? "grey.450" : "grey.300",
      outline: disabled
        ? "transparent"
        : `1px solid #8ACDE5`,
      outlineOffset: "0.125rem"
    }
  };

  const offsetOn = sizes.switcher[size].offsetOn;
  const offsetOff = sizes.switcher[size].offsetOff;

  const switcherStyles: ThemeUIStyleObject = {
    backgroundColor: disabled
      ? "grey.350"
      : toggled
        ? "primary.lightest"
        : "grey.250",
    transform: toggled ? `translateX(${offsetOn})` : `translateX(${offsetOff})`,
    margin: 0,
    borderRadius: "rounded",
    transition: `0.25s easy-in`,
    height: sizes.switcher[size].size,
    width: sizes.switcher[size].size
  };

  const handleToggle = (): void => {
    onChange?.(!toggled);
  };

  return (
    <button
      sx={toggleStyles}
      type="button"
      role="switch"
      aria-checked={toggled}
      onClick={handleToggle}
      aria-label={ariaLabel}
      ref={ref}
      disabled={disabled}
    >
      <div sx={switcherStyles}></div>
    </button>
  );
});

export { Toggle };
