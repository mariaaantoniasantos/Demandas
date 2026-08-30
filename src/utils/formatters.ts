export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return 'Sem prazo';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatRelativeDateBR(dateStr: string): { text: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } {
  if (!dateStr) {
    return { text: 'Sem prazo', isOverdue: false, isToday: false, isTomorrow: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      text: absDays === 1 ? 'Atrasado (ontem)' : `Atrasado há ${absDays} dias`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  }

  if (diffDays === 0) {
    return { text: 'Hoje', isOverdue: false, isToday: true, isTomorrow: false };
  }

  if (diffDays === 1) {
    return { text: 'Amanhã', isOverdue: false, isToday: false, isTomorrow: true };
  }

  if (diffDays <= 6) {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return {
      text: `${diasSemana[targetDate.getDay()]}, ${d}/${m}`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
    };
  }

  return {
    text: `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}`,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
  };
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'agora há pouco';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `há ${diffDays}d`;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} às ${hours}:${minutes}`;
  } catch {
    return 'data recente';
  }
}
