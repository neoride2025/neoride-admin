import { ModeratorsAPIService } from './../../apis/moderators.service';
import { Component } from '@angular/core';
import { PageItemComponent, TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective, FormCheckComponent } from '@coreui/angular';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { SharedModule } from '../../others/shared.module';

@Component({
  selector: 'app-moderators',
  imports: [PageItemComponent,
    SharedModule,
    TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, FormCheckComponent, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective],
  templateUrl: './moderators.component.html',
  styleUrl: './moderators.component.scss',
})
export class ModeratorsComponent {

  userData: any = {};
  moderators: any[] = [];
  // filteredRoles: any[] = [];
  paginatedData: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  showModal = false;
  isModalForUpdate = false;

  moderatorForm: any = {
    name: '',
    description: '',
    key: '',
    permissions: []
  };

  constructor(
    private helperService: HelperService,
    private toastService: ToastService,
    private moderator: ModeratorsAPIService
  ) {
    this.userData = helperService.getDataFromSession('userInfo');
  }

  ngOnInit() {
    this.getAllModerators();
  }

  getAllModerators() {
    this.moderator.getAllModerators().subscribe((res: any) => {
      if (res.status === 200) {
        this.moderators = res.data;
        this.totalPages = Math.ceil(this.moderators.length / this.pageSize);
        this.updatePagination();
      }
      else
        this.toastService.info(res.message);
    }, err => {
      this.toastService.error(err.error.message);
    })
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.moderators.slice(start, end);
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

  process() {
    if (!this.moderatorForm.name)
      return this.toastService.error('Please enter name');
    else if (!this.moderatorForm.key)
      return this.toastService.error('Please enter Role');
    else if (!this.helperService.validateCase(this.moderatorForm.key))
      return this.toastService.error('Role name must be uppercase');
    else if (this.moderatorForm.key.length < 3)
      return this.toastService.error('Role should be minimum 3 characters');
    else if (!this.moderatorForm.permissions.length)
      return this.toastService.error('Please select at least one permission');
    this.isModalForUpdate ? this.updateModerator() : this.createModerator();
  }

  createModerator() {
    this.moderator.createModerator(this.moderatorForm).subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 201) {
        this.toastService.success(res.message);
        this.closeModal();
        this.clearForm();
        this.getAllModerators();
      }
      else {
        this.toastService.info(res.message);
      }
    }, err => {
      console.log('err : ', err);
      this.toastService.error(err.error.message);
    })
  }

  updateModerator() {

  }

  clearForm() {
    this.moderatorForm = {
      name: '',
      email: '',
      mobile: '',
      description: '',
    };
  }

  //#endregion

}
