import type { ReactNode } from "react";
import { LuCircleCheck, LuInfo, LuTriangleAlert, LuX } from "react-icons/lu";
import styles from "./Alert.module.css";

type AlertKind = "info" | "success" | "warning" | "danger";

const ICONS = {
  info: LuInfo,
  success: LuCircleCheck,
  warning: LuTriangleAlert,
  danger: LuTriangleAlert,
} as const;

type AlertProps = {
  kind: AlertKind;
  children: ReactNode;
  // Shows a close button. Only usable from client components (functions can't cross to the client)
  onDismiss?: () => void;
};

const Alert = ({ kind, children, onDismiss }: AlertProps) => {
  const Icon = ICONS[kind];
  return (
    <div
      className={`${styles.alert} ${styles[kind]}`}
      role={kind === "danger" || kind === "warning" ? "alert" : "status"}
    >
      <Icon className={styles.icon} aria-hidden />
      <div className={styles.body}>{children}</div>
      {onDismiss && (
        <button
          type="button"
          className={`btn btn-ghost btn-icon ${styles.close}`}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <LuX />
        </button>
      )}
    </div>
  );
};

export default Alert;
