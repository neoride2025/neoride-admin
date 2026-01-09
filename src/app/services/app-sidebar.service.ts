import { Injectable } from "@angular/core";
import { INavData } from "@coreui/angular";
import { AppNavItem, MENU_ITEMS } from "../layout/default-layout/menu.config";
import { HelperService } from "./helper.service";

@Injectable({ providedIn: 'root' })
export class AppSidebarService {
    constructor(private helper: HelperService) { }

    /** MAIN FUNCTION YOU ASKED FOR */
    buildNav(): INavData[] {
        return this.filterNavItems(MENU_ITEMS);
    }

    /** Recursively filter nav items */
    private filterNavItems(items: AppNavItem[]): INavData[] {
        return items
            .map(item => {
                // ❌ No permission → drop item
                if (!this.hasPermission(item)) return null;

                // ✅ Handle children recursively
                let children: INavData[] | undefined;
                if (item.children && item.children.length > 0) {
                    children = this.filterNavItems(item.children);
                    // ❌ Parent with no visible children → drop it
                    if (children.length === 0) return null;
                }
                return {
                    ...item,
                    children
                };
            })
            .filter(Boolean) as INavData[];
    }

    private hasPermission(item: AppNavItem): boolean {
        const userPermissions: string[] = this.helper.getDataFromSession('permissions') || [];

        // public menu
        if (!item.permissions || item.permissions.length === 0) return true;

        // no permissions at all → block
        if (userPermissions.length === 0) return false;

        // ✅ correct check
        return item.permissions.some(p => userPermissions.includes(p));

        // console.log('item.permissions : ', item.permissions);
        // // console.log('item : ', this.helper.getDataFromSession('permissions').includes(item.permissions));
        // // console.log(this.helper.getDataFromSession('permissions'));
        // // return false;
        // const permissions = this.helper.getDataFromSession('permissions');
        // // console.log('permissions : ', permissions);
        // if (permissions.length === 0) return false;
        // return permissions.includes(item.permissions);
    }
}
