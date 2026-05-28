export interface CategorySubmittedEvent {
  category_id: number;
  resource: 'categories';
  message?: string;
}
