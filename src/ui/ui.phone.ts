import type { PhoneSelection } from "./ui.types";

interface PhonePickerOptions {
  container: HTMLElement;
  defaultSelection: PhoneSelection;
  onChange: (selection: PhoneSelection) => void;
}

export interface PhonePickerController {
  cleanup(): void;
}

export function attachPhonePicker(
  options: PhonePickerOptions,
): PhonePickerController | null {
  const countryPicker = options.container.querySelector(
    ".cw-country-picker",
  ) as HTMLElement | null;
  const countryDropdown = options.container.querySelector(
    ".cw-country-dropdown",
  ) as HTMLElement | null;

  if (!countryPicker || !countryDropdown) {
    return null;
  }

  const positionDropdown = () => {
    const pickerRect = countryPicker.getBoundingClientRect();
    const dropdownHeight = 320;
    const spaceAbove = pickerRect.top;
    const spaceBelow = window.innerHeight - pickerRect.bottom;
    const openAbove =
      spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    if (openAbove) {
      countryDropdown.style.bottom = `${window.innerHeight - pickerRect.top + 8}px`;
      countryDropdown.style.top = "auto";
    } else {
      countryDropdown.style.top = `${pickerRect.bottom + 8}px`;
      countryDropdown.style.bottom = "auto";
    }

    countryDropdown.style.left = `${pickerRect.left}px`;
    countryDropdown.style.minWidth = `${Math.max(360, pickerRect.width)}px`;
  };

  const closeDropdown = () => {
    countryDropdown.classList.remove("open");
    countryPicker.classList.remove("open");
  };

  const handlePickerClick = (event: Event) => {
    event.stopPropagation();
    const isOpen = countryDropdown.classList.contains("open");

    if (!isOpen) {
      positionDropdown();
    }

    countryDropdown.classList.toggle("open");
    countryPicker.classList.toggle("open");
  };

  const countryItems = Array.from(
    countryDropdown.querySelectorAll(".cw-country-item"),
  ) as HTMLElement[];

  const handleItemClick = (item: HTMLElement) => (event: Event) => {
    event.stopPropagation();

    const dialCode =
      item.getAttribute("data-code") || options.defaultSelection.dialCode;
    const countryCode =
      item.getAttribute("data-country-code") ||
      options.defaultSelection.countryCode;

    const codeSpan = countryPicker.querySelector(".cw-country-code");
    const nameSpan = countryPicker.querySelector(".cw-country-name");

    if (codeSpan) codeSpan.textContent = dialCode;
    if (nameSpan) nameSpan.textContent = countryCode;

    countryItems.forEach((countryItem) =>
      countryItem.classList.remove("selected"),
    );
    item.classList.add("selected");

    options.onChange({
      dialCode,
      countryCode,
    });

    closeDropdown();
  };

  const itemListeners = countryItems.map((item) => {
    const listener = handleItemClick(item);
    item.addEventListener("click", listener);
    return { item, listener };
  });

  const handleDocumentClick = () => closeDropdown();
  const handleResize = () => {
    if (countryDropdown.classList.contains("open")) {
      positionDropdown();
    }
  };
  const handleScroll = () => {
    if (countryDropdown.classList.contains("open")) {
      positionDropdown();
    }
  };

  countryPicker.addEventListener("click", handlePickerClick);
  document.addEventListener("click", handleDocumentClick);
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleScroll, true);

  return {
    cleanup() {
      closeDropdown();
      countryPicker.removeEventListener("click", handlePickerClick);
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      itemListeners.forEach(({ item, listener }) =>
        item.removeEventListener("click", listener),
      );
    },
  };
}
