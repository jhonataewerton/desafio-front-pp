import { HomeTask } from "./../../pages/home/shared/homeTask.model";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { take } from "rxjs/operators";
import { TasksService } from "src/app/pages/home/shared/tasks.service";
import { Page, PageRequest } from "../../share/utils/paginator/paginator";
import { MatDialog } from "@angular/material/dialog";
import { DialogComponent } from "../dialog-confirm/dialog.component";
import { CreateComponent } from "../form/create/create.component";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit {
  data: HomeTask[];
  displayedColumns: string[] = [
    "name",
    "title",
    "date",
    "value",
    "isPayed",
    " ",
  ];

  page: Page<HomeTask> = new Page([], 100);
  pageEvent: PageEvent;
  sortEvent: Sort;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  formGroupSearch: FormGroup;

  constructor(
    private taskService: TasksService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.formGroupSearch = this.formBuilder.group({
      search: [null],
    });
    this.listTasks();
  }

  clearSearch() {
    this.formGroupSearch.reset();
    this.listTasks();
  }

  listTasks() {
    const queryAdicional = new Map();
    if (this.formGroupSearch.value.search) {
      queryAdicional.set("name_like", this.formGroupSearch.value.search);
    }

    this.taskService
      .getTasks(
        new PageRequest(
          {
            pageNumber: this.pageEvent ? this.pageEvent.pageIndex : 0,
            pageSize: this.pageEvent ? this.pageEvent.pageSize : 5,
          },
          {
            property: this.sortEvent ? this.sortEvent.active : "id",
            direction: this.sortEvent ? this.sortEvent.direction : "asc",
          },
          queryAdicional
        )
      )
      .pipe(take(1))
      .subscribe(
        (page) => {
          console.log(page, "PAGE");
          this.page = page;
        },
        (error) => {
          this.page = new Page([], 0);
        }
      );
  }

  delete(task: HomeTask) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: "20%",
      data: task,
    });
    dialogRef.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.taskService.deleteTask(task).subscribe({
            next: (res) => {
              this.listTasks();
              console.log(res, "DELETADO");
            },
            error: () => {},
          });
        } else {
          console.log("NAO DELETADO");
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openEditTask(task: HomeTask) {
    console.log(task, "TASK");
    const dialogRef = this.dialog.open(CreateComponent, {
      data: task,
      width: "50%",
    });

    dialogRef.afterClosed().subscribe({
      next: (res) => {
        if (res) this.listTasks();
      },
    });
  }

  updateIsPayed(task: HomeTask, e: any) {
    let newTask = { ...task, isPayed: !e };

    this.taskService.updateTask(task.id, newTask).subscribe({
      next: (res) => {
        if (res) this.listTasks();
      },
    });
  }
}
