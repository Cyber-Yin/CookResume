import { cn } from "@/lib/utils";

const PasswordTip: React.FC<{
  passwordSecurity: number;
}> = ({ passwordSecurity }) => {
  return (
    <div
      className={cn(
        "flex w-full items-center space-x-4 rounded-lg border-[1.5px] px-4 py-2",
        {
          "border-danger-light": passwordSecurity < 2,
          "border-warning-light": passwordSecurity === 2,
          "border-success-light": passwordSecurity === 3,
        },
      )}
    >
      <div className="grid grow grid-cols-3 gap-2">
        <div
          className={cn("h-1.5 w-full rounded-lg", {
            "bg-custom-tertiary": passwordSecurity === 0,
            "bg-danger-light": passwordSecurity === 1,
            "bg-warning-light": passwordSecurity === 2,
            "bg-success-light": passwordSecurity === 3,
          })}
        ></div>
        <div
          className={cn("h-1.5 w-full rounded-lg", {
            "bg-custom-tertiary": passwordSecurity < 2,
            "bg-warning-light": passwordSecurity === 2,
            "bg-success-light": passwordSecurity === 3,
          })}
        ></div>
        <div
          className={cn("h-1.5 w-full rounded-lg", {
            "bg-custom-tertiary": passwordSecurity < 3,
            "bg-success-light": passwordSecurity === 3,
          })}
        ></div>
      </div>
      <div
        className={cn("text-sm font-semibold", {
          "text-red-500": passwordSecurity < 2,
          "text-yellow-500": passwordSecurity === 2,
          "text-green-500": passwordSecurity === 3,
        })}
      >
        {passwordSecurity < 2 ? "弱" : passwordSecurity === 2 ? "中" : "强"}
      </div>
    </div>
  );
};

export default PasswordTip;
