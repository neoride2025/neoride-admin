import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PageItemComponent, PageItemDirective, PageLinkDirective, PaginationComponent, PaginationModule, TableModule, ButtonDirective, FormDirective, FormControlDirective, FormLabelDirective, FormSelectDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, ModalToggleDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RolesComponent {

  roles: any[] = [
    {
      "_id": "ADMIN",
      "name": "Administrator",
      "role": "Admin",
      "description": "Full system access with all permissions",
      "permissions": [
        "DASHBOARD_VIEW",
        "USERS_VIEW",
        "USERS_CREATE",
        "USERS_EDIT",
        "USERS_DELETE",
        "ROLES_VIEW",
        "ROLES_MANAGE",
        "CONTACTS_VIEW",
        "CONTACTS_CREATE",
        "CONTACTS_EDIT",
        "CONTACTS_DELETE"
      ],
      "isSystemRole": true
    },
    {
      "_id": "MODERATOR",
      "name": "Moderator 1",
      "role": "Moderator",
      "description": "Can manage contacts and view users",
      "permissions": [
        "DASHBOARD_VIEW",
        "USERS_VIEW",
        "CONTACTS_VIEW",
        "CONTACTS_CREATE",
        "CONTACTS_EDIT"
      ]
    },
    {
      "_id": "VIEWER",
      "name": "Viewer 1",
      "role": "Viewer",
      "description": "Read-only access",
      "permissions": [
        "DASHBOARD_VIEW",
        "USERS_VIEW",
        "CONTACTS_VIEW"
      ]
    }
  ];
  paginatedData: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  // new / update permission
  isModalForUpdate = false;
  interests: string[] = [
    'JavaScript', 'Python', 'React', 'Vue.js', 'Angular',
    'Node.js', 'TypeScript', 'HTML/CSS', 'MongoDB', 'PostgreSQL',
    'Docker', 'Kubernetes', 'AWS', 'Machine Learning', 'DevOps',
    'GraphQL', 'REST API', 'Git', 'Agile', 'Testing'
  ];
  selectedItems: string[] = [];

  ngOnInit() {
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

  get sortedInterests(): string[] {
    return [...this.interests].sort((a, b) => {
      const aSelected = this.selectedItems.includes(a);
      const bSelected = this.selectedItems.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }

  toggleChip(interest: string): void {
    const index = this.selectedItems.indexOf(interest);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(interest);
    }
  }

  isSelected(interest: string): boolean {
    return this.selectedItems.includes(interest);
  }

  //#endregion

}