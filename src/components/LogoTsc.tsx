import logoTsc from "../assets/logo-tsc.png";

type LogoTscProps = {
  compact?: boolean;
};

export default function LogoTsc({
  compact = false,
}: LogoTscProps) {
  return (
    <div
      className={`tsc-logo-container ${
        compact ? "tsc-logo-compact" : ""
      }`}
    >
      <img
        src={logoTsc}
        alt="Logo Temple du Savoir Club"
        className="tsc-logo-image"
      />

      {!compact && (
        <div className="tsc-logo-text">
          <strong>TSC</strong>
          <span>Management</span>
        </div>
      )}
    </div>
  );
}