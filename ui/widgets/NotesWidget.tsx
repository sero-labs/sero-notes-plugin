/**
 * NotesWidget — pinned and recent notes at a glance for the dashboard.
 *
 * Pinned notes surface first (pin icon), then the most recently edited, each
 * with a body preview and when it changed. Composed from the shared
 * @sero-ai/ui dashboard set.
 */

import { useMemo } from 'react';
import { useAppState } from '@sero-ai/app-runtime';
import {
  ActivityList,
  ActivityListItem,
  DataBoundary,
  EmptyState,
  Inline,
  Stack,
  Status,
  Text,
  WidgetContent,
} from '@sero-ai/ui';
import { FileText, NotebookPen, Pin } from 'lucide-react';
import type { Note, NotesState } from '../../shared/types';
import { DEFAULT_NOTES_STATE } from '../../shared/types';
import '../widget.css';

/** How many notes the pinboard peeks before "+N more". */
const SHOWN = 6;

/** "now" / "5m" / "2h" / "3d" — compact relative age of an ISO timestamp. */
function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/** Pinned notes first, then most-recently-edited. */
function orderNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function NotesWidget() {
  const [state] = useAppState<NotesState>(DEFAULT_NOTES_STATE);

  const ordered = useMemo(() => orderNotes(state.notes), [state.notes]);
  const pinnedCount = state.notes.filter((n) => n.pinned).length;

  return (
    <WidgetContent>
      <Stack gap="sm" fill>
        <Inline justify="between" align="center">
          <Inline gap="xs" align="end">
            <Text variant="numeric">{state.notes.length}</Text>
            <Text variant="muted">notes</Text>
          </Inline>
          {pinnedCount > 0 && (
            <Status tone="warning" variant="pill">
              {pinnedCount} pinned
            </Status>
          )}
        </Inline>

        <DataBoundary
          state={state.notes.length === 0 ? 'empty' : 'ready'}
          empty={<EmptyState icon={NotebookPen} title="No notes yet" />}
        >
          <Stack gap="none" scroll>
            <ActivityList overflowCount={Math.max(0, state.notes.length - SHOWN)}>
              {ordered.slice(0, SHOWN).map((note) => (
                <NoteRow key={note.id} note={note} />
              ))}
            </ActivityList>
          </Stack>
        </DataBoundary>
      </Stack>
    </WidgetContent>
  );
}

function NoteRow({ note }: { note: Note }) {
  const title = note.title || 'Untitled';
  const preview = note.body.slice(0, 80).trim();
  return (
    <ActivityListItem
      icon={note.pinned ? Pin : FileText}
      tone={note.pinned ? 'warning' : 'neutral'}
      label={<span title={title}>{title}</span>}
      detail={preview || undefined}
      timestamp={relativeTime(note.updatedAt)}
    />
  );
}

export default NotesWidget;
