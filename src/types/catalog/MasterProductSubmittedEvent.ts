export interface MasterProductSubmittedEvent {
  master_product_id: number;
  resource: 'master-products';
  message?: string;
}
