import { profileImg } from "../../../../assets/exports";

const NavAvatar = () => {
  return (
    <li className="nav-item dropdown pe-3">
      <a
        href="#"
        className="nav-link nav-profile d-flex items-center pe-0"
        data-bs-toggle="dropdown"
      >
        <img src={profileImg} alt="Profile" className="rounded-full" />
      </a>

      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
        <li className="dropdown-header">
          <h4 className="font-jetBrains text-main-light-blue-dark">Aditya</h4>
          <span>Super User</span>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a
            href="users-profile.html"
            className="dropdown-item d-flex items-center"
          >
            <i className="bi bi-person"></i>
            <span className="pl-2">My Profile</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a
            href="users-profile.html"
            className="dropdown-item d-flex items-center"
          >
            <i className="bi bi-gear"></i>
            <span className="pl-2">Account Settings</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a
            href="users-profile.html"
            className="dropdown-item d-flex items-center"
          >
            <i className="bi bi-question-circle"></i>
            <span className="pl-2">Tips and Tutorials</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a
            href="users-profile.html"
            className="dropdown-item d-flex items-center"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="pl-2">Log out</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
      </ul>
    </li>
  );
};

export default NavAvatar;
