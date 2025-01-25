"use client";

const Logo = () => {
  const handleToggleSideBar = () => {
    document.body.classList.toggle("toggle-sidebar");
  };

  return (
    <div className="flex items-center justify-center">
      <a href="/" className="logo flex items-center">
        <span className="font-jetBrainsExtraBold text-main-light-blue text-[26px]">
          PowerHouse
        </span>
      </a>
      <i
        className="bi bi-list toggle-sidebar-btn text-main-light-blue"
        onClick={handleToggleSideBar}
      ></i>
    </div>
  );
};

export default Logo;
