import Logo from "./Logo";
import Nav from "./Nav/Nav";
import SearchBar from "./SearchBar";

const Header = () => {
  return (
    <header id="header" className="header flex items-center fixed-top">
      {/* {logo} */}
      <Logo />

      {/* {search} */}
      <SearchBar />

      {/* {nav} */}
      <Nav />
    </header>
  );
};

export default Header;
