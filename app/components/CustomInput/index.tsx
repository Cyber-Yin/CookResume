import { Input, InputProps } from "@nextui-org/react";

const CustomInput: React.FC<{
  props?: InputProps;
}> = ({ props }) => {
  return (
    <Input
      {...props}
      classNames={{
        label: ["font-semibold", "text-custom-primary"],
        inputWrapper: [
          "shadow-none",
          "border-1.5",
          "border-primary-200",
          "data-[hover=true]:border-default-300",
          "border-default-300",
          "rounded-md",
        ],
        input: ["placeholder:text-custom-secondary", "text-custom-primary"],
        errorMessage: ["text-xs", "font-semibold"],
        ...props?.classNames,
      }}
      color="primary"
      variant="bordered"
      radius="sm"
      labelPlacement="outside"
    />
  );
};

export default CustomInput;
