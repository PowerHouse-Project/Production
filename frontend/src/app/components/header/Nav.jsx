import NavAvatar from "./NavAvatar";
import NavMessage from "./NavMessage";
import NavNotice from "../header/Nav/NavNotice";

const Nav = () => {
  return (
    <nav className="header-nav ms-auto">
      <ul className="flex items-center">
        <NavNotice />
        <NavMessage />
        <NavAvatar />
      </ul>
    </nav>
  );
};

export default Nav;
