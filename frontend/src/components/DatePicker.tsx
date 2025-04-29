import { TextBox, TextBoxProps } from './TextBox';

interface DatePickerProps extends Omit<TextBoxProps, 'type'> {
  label: string;
}

const DatePicker = (props: DatePickerProps) => (
  <TextBox
    {...props}
    type="date"
    slotProps={{
      inputLabel: { shrink: true, style: { color: '#78909C', fontSize: '0.875rem' } },
      ...props.slotProps,
    }}
  />
);

export default DatePicker;