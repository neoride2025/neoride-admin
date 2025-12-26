import { Component, inject } from '@angular/core';
import { TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective, FormCheckComponent, FormCheckInputDirective, BadgeComponent } from '@coreui/angular';
import { HelperService } from '../../services/helper.service';
import { ToastService } from '../../services/toast.service';
import { SharedModule } from '../../others/shared.module';
import { ModeratorAPIService } from '../../apis/moderator.service';
import { DatePipe } from '@angular/common';
import { RoleAPIService } from '../../apis/role.service';

@Component({
  selector: 'app-moderators',
  imports: [SharedModule,
    TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, DatePipe, BadgeComponent,
    FormCheckComponent, FormCheckInputDirective, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective],
  templateUrl: './moderators.component.html',
  styleUrl: './moderators.component.scss',
})
export class ModeratorsComponent {

  // injectable dependencies
  helperService = inject(HelperService);
  toastService = inject(ToastService);
  moderator = inject(ModeratorAPIService);
  role = inject(RoleAPIService);

  // common things
  config: any = this.helperService.config;
  userInfo: any = this.helperService.getDataFromSession('userInfo');
  loading = false;
  loaderMessage = '';

  // table & list
  moderators: any[] = [];
  paginatedData: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  // new / update permission
  showModal = false;
  submitting = false;
  isModalForUpdate = false;
  roles: any[] = [];
  moderatorForm = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: '',
    description: '',
    isSystemUser: false,
  }

  ngOnInit() {
    this.getModerators();
    this.getRoles();
    this.helperService.closeModalIfOpened(() => {
      this.closeModal(true);
    });
  }

  getRoles() {
    this.roles = [];
    this.role.getRoles().subscribe((res: any) => {
      if (res.status === 200)
        this.roles = res.data;
    })
  }

  getModerators() {
    this.moderators = [];
    this.loading = true;
    this.loaderMessage = 'Loading moderators...';
    this.moderator.getModerators().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.moderators = res.data;
        this.prepareModerators();
      }
      else
        this.toastService.error(res.message);
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  prepareModerators() {
    this.totalPages = Math.ceil(this.moderators.length / this.pageSize);
    this.updatePagination();
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

  //#region Table action functions

  onCheckboxChange(permission: any) {
    permission.isActive = !permission.isActive;
  }

  //#endregion

  //#region new / update permission

  process() {
    this.isModalForUpdate ? this.updatePermission() : this.createPermission();
  }

  validateForm() {
    if (!this.moderatorForm.name)
      return this.toastService.error('Please enter moderator name');
    else if (!this.moderatorForm.email)
      return this.toastService.error('Please enter email');
    else if (!this.helperService.validateEmail(this.moderatorForm.email))
      return this.toastService.error('Please enter valid email');
    else if (!this.moderatorForm.password)
      return this.toastService.error('Please enter password');
    else if (this.moderatorForm.password.length < 6)
      return this.toastService.error('Password should be minimum 6 characters');
    else if (!this.moderatorForm.role)
      return this.toastService.error('Please select role');
    return true;
  }

  createPermission() {
    const isFormValid = this.validateForm();
    if (!isFormValid) return;
    this.submitting = true;
    this.loaderMessage = 'Creating moderator...';
    this.moderator.createModerator(this.moderatorForm).subscribe((res: any) => {
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
    this.moderators.push(permission);
    this.prepareModerators();
  }

  updatePermission() {

  }

  clearForm() {
    this.moderatorForm = {
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: '',
      description: '',
      isSystemUser: false,
    };
  }

  closeModal(clearForm?: boolean) {
    clearForm ? this.clearForm() : '';
    this.showModal = false;
  }

  //#endregion
}
