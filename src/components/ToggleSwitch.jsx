// Libraries
import PropTypes from "prop-types";
import React from "react";

const tickIcon = <svg height="8" viewBox="0 0 8 8" width="8" xmlns="http://www.w3.org/2000/svg"><path d="m12.9537037 31.287037-4.83333333 4.8333334c-.04321009.0308643-.08333315.0462963-.12037037.0462963s-.07716028-.015432-.12037037-.0462963l-2.83333333-2.8333334c-.08024732-.0802473-.08024732-.1604934 0-.2407407l1.16666666-1.1666667c.08024732-.0802473.16049343-.0802473.24074074 0l1.5462963 1.5555556 3.5462963-3.5555556c.0802473-.0802473.1604934-.0802473.2407407 0l1.1666667 1.1666667c.0802473.0802473.0802473.1604934 0 .2407407z" fill="#1abc9c" fillRule="evenodd" transform="translate(-5.006945 -28.993055)"/></svg>

const lockIcon = <svg height="9" viewBox="0 0 7 9" width="7" xmlns="http://www.w3.org/2000/svg"><path d="m12.65625 9.21728516c.1358031 0 .2530859.04938222.3518519.14814814.0987659.09876593.1481481.21604871.1481481.35185186v3.50000004c0 .1358031-.0493822.2530859-.1481481.3518518-.098766.0987659-.2160488.1481482-.3518519.1481482h-5c-.13580315 0-.25308593-.0493823-.35185185-.1481482-.09876593-.0987659-.14814815-.2160487-.14814815-.3518518v-3.50000004c0-.13580315.04938222-.25308593.14814815-.35185186.09876592-.09876592.2160487-.14814814.35185185-.14814814h.5v-1.5c0-.54938547.19598569-1.02005977.58796296-1.41203704s.86265158-.58796296 1.41203704-.58796296c.5493855 0 1.0200598.19598569 1.412037.58796296.3919773.39197727.587963.86265157.587963 1.41203704v1.5zm-3.5-1.5v1.5h2v-1.5c0-.27777917-.0972213-.51388792-.2916667-.70833334-.1944454-.19444541-.4305541-.29166666-.7083333-.29166666-.27777917 0-.51388792.09722125-.70833333.29166666-.19444542.19444542-.29166667.43055417-.29166667.70833334z" fill="#dedede" fillRule="evenodd" transform="translate(-7 -5)"/></svg>

function ToggleSwitch({on, pending, onClick, onDisabledClick, enabled, className, children}) {
  const classes = ["switch", className, (on ? "on " : ""), (enabled ? "" : "disabled ")].join(" ");
  return (
    <div className={classes} onClick={(e) => enabled ? onClick(e) : onDisabledClick(e)}>
      <div className="toggle-switch" children={children}>
        {
          on ?
            pending ? <div className="switch-spinner"></div> : tickIcon
          :
            pending ? <div className="switch-spinner"></div> : lockIcon
        }
      </div>
    </div>
  );
}

ToggleSwitch.propTypes = {
  on: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  enabled: PropTypes.bool,
  className: PropTypes.string
};

ToggleSwitch.defaultProps = {
  enabled: true,
  className: "",
  onDisabledClick: () => {}
};

export default ToggleSwitch;
