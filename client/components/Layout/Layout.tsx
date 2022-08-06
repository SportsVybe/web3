import styles from "../../styles/Home.module.css";
import Navbar from "./Navbar";

type Props = {
  children: JSX.Element;
};

export default function Layout({ children }: Props) {
  return (
    <div className="flex flex-col">
      <div className="gradient-bg-welcome">
      <Navbar />
      </div>
      <main className={styles.main}>{children}</main>
      <footer className="text-center mt-10 mb-3 text-white">
        &copy; {new Date().getFullYear()} SportsVybe. All rights reserved.
      </footer>
    </div>
  );
}
