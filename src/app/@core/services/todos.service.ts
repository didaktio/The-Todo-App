import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { DbService, arrayAdd, arrayRemove } from './db.service';
import { TodoItem, TodoUser } from 'utils';

import { map, first, switchMap } from 'rxjs/operators';
import { BehaviorSubject, of, Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class TodosService {

  constructor(
    private auth: AuthService,
    private db: DbService) {

    // db.updateDb({ todos: { pending: TODOS_MOCK } })

  }

  sortItemsBy$ = new BehaviorSubject<SortOption>('Date Due');

  items$ = this.auth.user$.pipe(
    switchMap(user => {
      if (!user) return of(null);

      return this.sortItemsBy$.pipe(
        map(sorter => sortList([...user.todos.completed, ...user.todos.pending], sorter))
      );

    })) as Observable<TodoItem[]>;
  trash$ = this.auth.user$.pipe(map(user => user ? user.trash : null));

  add(item: TodoItem) {
    return this.db.updateDb({
      todos: {
        pending: arrayAdd({
          ...item,
          id: this.genID()
        })
      },
      ...(item.reminders.length) ? {
        reminders: arrayAdd(...item.reminders.map(r => r.date))
      } : false
    });
  }

  async replace(before: TodoItem, after: TodoItem) {
    const list = await this.auth.user$.pipe(
      map(user => before.complete ? user.todos.completed : user.todos.pending),
      first()
    ).toPromise();

    const index = list.findIndex(t => t === before);
    list.splice(index, 1, after);

    return this.db.updateDb({
      todos: { [before.complete ? 'complete' : 'pending']: list },
      ...(!before.reminders.length && after.reminders.length) ? {
        reminders: arrayAdd(...after.reminders.map(r => r.date))
      } : (before.reminders.length && !after.reminders.length) ? {
        reminders: arrayRemove(...before.reminders.map(r => r.date))
      } : false
    }
    );
  }

  delete(item: TodoItem) {
    return this.db.updateDb({
      todos: {
        pending: arrayRemove(item),
        completed: arrayRemove(item),
      },
      trash: arrayAdd(item)
    });
  }

  async complete(item: TodoItem) {
    return this.db.updateDb({
      todos: {
        pending: arrayRemove(item),
        completed: arrayAdd({
          ...item,
          complete: true
        })
      }
    });
  }

  async uncomplete(item: TodoItem){
    return this.db.updateDb({
      todos: {
        completed: arrayRemove(item),
        pending: arrayAdd({
          ...item,
          complete: false
        })
      }
    });
  }

  restoreFromTrash(item: TodoItem) {
    return this.db.updateDb({
      trash: arrayRemove(item),
      todos: { [item.complete ? 'completed' : 'pending']: arrayAdd(item) }
    });
  }

  clearTrash() {
    return this.db.updateDb({ trash: [] });
  }

  private mergeIncoming(current: TodoItem[], incoming: TodoItem[]) {
    const currentItemIDs = current.map(item => item.id);
    const merged: TodoItem[] = [];

    for (const item of incoming) if (!currentItemIDs.includes(item.id)) merged.push(item);

    return current.concat(merged);
  }

  async setTodos(todos: TodoUser['todos'], { merge } = { merge: false }) {
    if (!merge) return this.db.updateDb({ todos });
    else {
      const currentTodos = await this.auth.user$.pipe(map(user => user.todos), first()).toPromise();
      currentTodos.completed = this.mergeIncoming(currentTodos.completed, todos.completed);
      currentTodos.pending = this.mergeIncoming(currentTodos.pending, todos.pending);

      return this.db.updateDb({ todos: currentTodos });
    }

  }

  async setTrash(trash: TodoItem[], { merge } = { merge: false }) {
    if (!merge) return this.db.updateDb({ trash });
    else {
      let currentTrash = await this.trash$.pipe(first()).toPromise();
      currentTrash = this.mergeIncoming(currentTrash, trash);
      return this.db.updateDb({ trash: currentTrash });
    }
  }

  genID() {
    return Math.random().toString(36).substring(8);
  }
}


export const SORT_OPTIONS = [
  'Date Due',
  'Date Added',
  'Last Edited'
] as const;
export type SortOption = typeof SORT_OPTIONS[number];

const sortList = (items: TodoItem[], sorter: SortOption) => {
  switch (sorter) {
    case 'Date Due': return items.sort((a, b) =>
      (b.dateDue && a.dateDue) ? new Date(a.dateDue.date).getTime() - new Date(b.dateDue.date).getTime() : +!!b.dateDue - +!!a.dateDue);
    case 'Last Edited': return items.sort((a, b) =>
      (b.lastEdited && a.lastEdited) ? new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime() : +!!b.lastEdited - +!!a.lastEdited);
    case 'Date Added': return items.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }
}