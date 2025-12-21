import { RolesAPIService } from './../../apis/roles.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, FormControlDirective, FormDirective, FormLabelDirective, FormSelectDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective } from '@coreui/angular';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-modules',
  imports: [TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective],
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModulesComponent {

  modules: any[] = [
    // {
    //   "_id": "DASHBOARD",
    //   "label": "Dashboard",
    //   "totalPages": 1,
    // },
    // {
    //   "_id": "USERS",
    //   "label": "User Management",
    //   "totalPages": 2
    // },
    // {
    //   "_id": "ROLES",
    //   "label": "Role Management",
    //   "totalPages": 1
    // },
    // {
    //   "_id": "CONTACTS",
    //   "label": "Contacts",
    //   "totalPages": 1
    // },
    // {
    //   "_id": "SETTINGS",
    //   "label": "Settings",
    //   "totalPages": 1
    // }
  ]
  paginatedData: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  // new / update permission
  isModalForUpdate = false;

  constructor(
    private rolesAPIService: RolesAPIService,
    private helperService: HelperService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.getModules()
  }

  getModules() {
    this.rolesAPIService.getModules().subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 200) {
        this.modules = res.data;
        this.prepareModules();
      }
      else {
        this.toastService.error(res.message);
        this.modules = [];
      }
    }, err => {
      console.log('err : ', err);
    })
  }

  prepareModules() {
    this.totalPages = Math.ceil(this.modules.length / this.pageSize);
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.modules.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages });
  }

}