import { SharedModule } from './../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { PageItemComponent, PageItemDirective, PageLinkDirective, PaginationComponent, PaginationModule, TableModule, ButtonDirective, FormDirective, FormControlDirective, FormLabelDirective, FormSelectDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective } from '@coreui/angular';
import { RolesAPIService } from '../../apis/roles.service';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [SharedModule,
    PageItemComponent,
    TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, ModalFooterComponent, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RolesComponent {

  userData: any = {};
  roles: any[] = [];
  // filteredRoles: any[] = [];
  paginatedData: any[] = [];

  search = '';

  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  // new / update role
  showModal = false;
  isModalForUpdate = false;
  selectedItems: string[] = [];
  modules: any[] = [];
  roleForm: any = {
    name: '',
    description: '',
    key: '',
    permissions: []
  };

  constructor(
    private role: RolesAPIService,
    private helperService: HelperService,
    private toastService: ToastService
  ) {
    this.userData = helperService.getDataFromSession('userInfo');
  }

  ngOnInit() {
    this.getAllRoles();
    this.getAllPermissions();
  }

  getAllRoles() {
    this.role.getAllRoles().subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 200) {
        this.roles = res.data;
        // this.filteredRoles = [...this.roles];
        this.totalPages = Math.ceil(this.roles.length / this.pageSize);
        this.updatePagination();
      }
      else 
        this.toastService.info(res.message);
    }, err => {
      console.log('err : ', err);
      this.toastService.error(err.error.message);
    })
  }

  // function for search
  applyFilter() {

    const value = this.search.toLowerCase().trim();
    console.log('value : ', value);
    // this.filteredRoles = this.roles.filter(row =>
    //   Object.values(row).some(v =>
    //     String(v).toLowerCase().includes(value)
    //   )
    // );

    this.currentPage = 1;            // 🔴 reset page on filter
    this.updatePagination();
  }


  getAllPermissions() {
    this.role.getPermissionsByGrouped().subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 200) {
        this.modules = res.data;
        console.log('modules : ', this.modules);
      }
    })
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.roles.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages });
  }

  //#region new / update permission

  closeModal() {
    this.showModal = false;
  }

  getSortedPermissions(modulePermissions: string[]): any[] {
    return sortBySelection(modulePermissions, this.selectedItems);
  }

  getSelectedCount(modulePermissions: string[]): number {
    return countSelectedInModule(modulePermissions, this.selectedItems);
  }

  toggleChip(permission: any): void {
    const index = this.selectedItems.indexOf(permission);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
      this.roleForm.permissions.splice(index, 1);
    } else {
      this.selectedItems.push(permission);
      this.roleForm.permissions.push(permission.key);
    }
  }

  isSelected(permission: string): boolean {
    return this.selectedItems.includes(permission);
  }

  process() {
    if (!this.roleForm.name)
      return this.toastService.error('Please enter name');
    else if (!this.roleForm.key)
      return this.toastService.error('Please enter Role');
    else if (!this.helperService.validateCase(this.roleForm.key))
      return this.toastService.error('Role name must be uppercase');
    else if (this.roleForm.key.length < 3)
      return this.toastService.error('Role should be minimum 3 characters');
    else if (!this.roleForm.permissions.length)
      return this.toastService.error('Please select at least one permission');
    this.isModalForUpdate ? this.updateRole() : this.createRole();
  }

  createRole() {
    // add created by
    this.roleForm.createdBy = this.userData._id;
    this.role.createRole(this.roleForm).subscribe((res: any) => {
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal();
        this.clearForm();
        this.getAllRoles();
      }
      else
        this.toastService.info(res.message);
    }, err => {
      console.log('err : ', err);
      this.toastService.error(err.error.message);
    })
  }

  updateRole() {
    this.role.updateRole(this.roleForm).subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal();
        this.clearForm();
        this.getAllRoles();
      }
      else {
        this.toastService.info(res.message);
      }
    }, err => {
      console.log('err : ', err);
      this.toastService.error(err.error.message);
    })
  }

  clearForm() {
    this.roleForm = {
      name: '',
      description: '',
      key: '',
      permissions: []
    };
    this.selectedItems = [];
  }

  //#endregion

}

function sortBySelection(
  items: string[],
  selectedItems: string[]
): string[] {
  const selectedSet = new Set(selectedItems);

  return [...items].sort((a, b) => {
    const aSelected = selectedSet.has(a);
    const bSelected = selectedSet.has(b);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
}

function countSelectedInModule(
  moduleItems: string[],
  selectedItems: string[]
): number {
  const selectedSet = new Set(selectedItems);
  return moduleItems.filter(item => selectedSet.has(item)).length;
}