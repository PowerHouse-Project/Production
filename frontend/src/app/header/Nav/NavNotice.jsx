/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

const NavNotice = () => {
  return (
    <li className="nav-item dropdown">
      <a href="#" className="nav-link nav-icon" data-bs-toggle="dropdown">
        <i className="bi bi-bell"></i>
        <span className="badge bg-main-light-blue-dark badge-number">4</span>
      </a>

      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
        <li className="dropdown-header">
          You have 4 notifications
          <a href="#">
            <span className="badge rounded-pill bg-main-light-blue-neutral p-2 ms-2">
              View all
            </span>
          </a>
        </li>

        <li>
          <hr className="dropdown-divider" />
        </li>

        <li className="notification-item">
          <i className="bi bi-check-circle text-success"></i>
          <div>
            <h4>Device Added</h4>
            <p>A new device has been added to your Home</p>
            <p>30 min. ago</p>
          </div>
        </li>

        <li>
          <hr className="dropdown-divider" />
        </li>

        <li className="dropdown-footer">
          <a href="#">Show all notifications</a>
        </li>
      </ul>
    </li>
  );
};

export default NavNotice;
