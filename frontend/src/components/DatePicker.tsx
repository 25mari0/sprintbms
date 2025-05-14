import { TextBox, TextBoxProps } from './TextBox';

interface DatePickerProps extends Omit<TextBoxProps, 'type'> {
  label: string;
  showTime?: boolean;   // new prop
}

const DatePicker = ({
  showTime = false,
  ...props
}: DatePickerProps) => (
  <TextBox
    {...props}
    type={showTime ? 'datetime-local' : 'date'}
    slotProps={{
      inputLabel: {
        shrink: true,
        style: { color: '#78909C', fontSize: '0.875rem' },
      },
      ...props.slotProps,
    }}
    sx={{
      // tint the calendar icon:
      '& input::-webkit-calendar-picker-indicator': {
        filter: 'invert(0.7)',
      },
      '& input::-moz-calendar-picker-indicator': {
        filter: 'invert(0.7)',
      },
      ...props.sx,
    }}
  />
);

export default DatePicker;
