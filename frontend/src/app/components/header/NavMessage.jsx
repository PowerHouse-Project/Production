import React from "react";
import { messages1 } from "../../../../assets/exports";

const NavMessage = () => {
  return (
    <li className="nav-item dropdown">
      <a href="#" className="nav-link nav-icon" data-bs-toggle="dropdown">
        <i className="bi bi-people"></i>
      </a>

      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages">
        <li className="dropdown-header">
          You have 3 new messages
          <a href="#">
            <span className="badge rounded-pill bg-main-light-blue-neutral p-2 ms-2">
              View all
            </span>
          </a>
        </li>

        <li>
          <hr className="dropdown-divider" />
        </li>

        <li className="message-item pl-5 pr-5 pt-2">
          <a href="#">
            <img
              src={messages1}
              alt="Maria"
              className="rounded-full w-12 h-12"
            />
          </a>
          <div className="flex flex-col flex-wrap">
            <h4>Maria Hudson</h4>
            <p>A family member has been added to your Home</p>
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

export default NavMessage;
