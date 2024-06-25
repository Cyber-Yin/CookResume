import { Button } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <header className="flex h-20 w-full items-center justify-between bg-primary px-4 shadow sm:px-6">
        <h1 className="text-xl font-bold">酷客简历</h1>
        <Button
          onPressEnd={() => navigate("/sign-in")}
          radius="sm"
          className="bg-theme text-white"
        >
          登录
        </Button>
      </header>
    </>
  );
};

export default Header;
