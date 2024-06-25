import { Checkbox, CheckboxProps } from "@nextui-org/react";

const CustomCheckbox: React.FC<{
  props?: CheckboxProps;
  children: React.ReactNode;
}> = ({ props, children }) => {
  return (
    <Checkbox
      {...props}
      size="sm"
      classNames={{
        base: ["text-sm", "font-semibold"],
        wrapper: [
          "before:rounded-sm",
          "rounded-sm",
          "after:rounded-sm",
          "before:border-1.5",
        ],
        ...props?.classNames,
      }}
    >
      {children}
    </Checkbox>
  );
};

export default CustomCheckbox;
