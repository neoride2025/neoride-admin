import { SharedModule } from './../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { PageItemDirective, PageLinkDirective, PaginationComponent, PaginationModule, TableModule, ButtonDirective, FormDirective, FormControlDirective, FormLabelDirective, FormSelectDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, BadgeComponent } from '@coreui/angular';
import { RoleAPIService } from '../../apis/role.service';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { DatePipe } from '@angular/common';
import { LoaderComponent } from '../../global-components/loader/loader.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [SharedModule, LoaderComponent,
    TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, DatePipe, BadgeComponent,
    FormCheckComponent, FormCheckInputDirective, FormSelectDirective, FormControlDirective, FormDirective, FormLabelDirective],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RolesComponent {


  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  role = inject(RoleAPIService);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  submitting = false;
  loaderMessage = '';

  // table & list
  roles: any[] = [];
  paginatedData: any[] = [];
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
    permissions: []
  };

  ngOnInit() {
    this.getRoles();
    this.getAllPermissions();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getRoles() {
    this.loading = true;
    this.loaderMessage = 'Loading roles...';
    this.roles = [];
    this.role.getRoles().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.roles = res.data;
        this.prepareRoles();
      }
      else
        this.toastService.info(res.message);
    }, err => {
      console.log('err : ', err);
      this.toastService.error(err.error.message);
    })
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

  prepareRoles() {
    this.totalPages = Math.ceil(this.roles.length / this.pageSize);
    this.updatePagination();
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
    else if (!this.roleForm.permissions.length)
      return this.toastService.error('Please select at least one permission');
    this.isModalForUpdate ? this.updateRole() : this.createRole();
  }

  createRole() {
    this.submitting = true;
    this.loaderMessage = 'Creating role...';
    this.role.createRole(this.roleForm).subscribe((res: any) => {
      this.submitting = false;
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.pushNewModuleToList(res.data);
      }
      else
        this.toastService.info(res.message);
    }, err => {
      console.log('err : ', err);
      this.submitting = false;
      this.toastService.error(err.error.message);
    })
  }

  // will push the recently created permission to the list without call the API
  pushNewModuleToList(permission: any) {
    this.roles.push(permission);
    this.prepareRoles();
  }

  updateRole() {
    this.role.updateRole(this.roleForm).subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal(true);
        this.getRoles();
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
      permissions: []
    };
    this.selectedItems = [];
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
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