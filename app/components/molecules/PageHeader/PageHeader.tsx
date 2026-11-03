import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  // Buttons etc. on the right
  actions?: ReactNode;
};

const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <header className={styles.header}>
    <div>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </header>
);

export default PageHeader;
