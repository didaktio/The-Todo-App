import { parseISO, format } from 'date-fns/esm';

export const formatDateShort = (d: string) => {
    return format(parseISO(d), 'dd/MM/yy');
}

export const formatDateLong = (d: string) => {
    return format(parseISO(d), `E, do MMM yyyy 'at' h:mma`);
}
