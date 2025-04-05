const formatDateInternal = (
  dateInput: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US"
): string => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    console.error("Invalid Date:", dateInput);
    return String(dateInput ?? "");
  }

  return date.toLocaleString(locale, options);
};

export const formatDisplayDate = (
  dateString: string | null | undefined
): string =>
  formatDateInternal(dateString, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatDisplayDateTime = (
  dateString: string | null | undefined
): string =>
  formatDateInternal(dateString, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
