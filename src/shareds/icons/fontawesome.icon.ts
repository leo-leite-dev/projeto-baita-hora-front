import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faCalendar, faDollarSign, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

export function registerIcons(library: FaIconLibrary): void {
  library.addIcons(
    faTimes,
    faCalendar,
    faDollarSign,
    faMoneyBillWave
  );
}