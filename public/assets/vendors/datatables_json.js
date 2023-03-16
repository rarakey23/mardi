
function datatables_lyn(table, json_url, url_action, columns, btn = null, head_label = 'List') {
    if (btn == null) {
        btn = [{
            text: feather.icons['trash'].toSvg({
                class: 'me-50 font-small-4'
            }) + 'Delete',
            className: 'btn btn-outline-danger is-button-delete',
        }, {
            text: feather.icons['plus'].toSvg({
                class: 'me-50 font-small-4'
            }) + 'Add New',
            className: 'create-new btn btn-primary',
            attr: {
                'data-bs-toggle': 'modal',
                'data-bs-target': '#modalsaddnew'
            }
        }]
    }
    $(document).ready(function () {
        $(table).DataTable({
            processing: true,
            serverSide: true,
            ajax: json_url,
            serverMethod: 'get',
            columns: columns,

            language: {
                paginate: {
                    previous: '&nbsp;',
                    next: '&nbsp;'
                },
            },
            columnDefs: [{
                // For Responsive
                className: 'control',
                orderable: false,
                responsivePriority: 2,
                targets: 0
            },
            {
                // For Checkboxes
                targets: 1,
                orderable: false,
                responsivePriority: 3,
                render: function (data, type, full, meta) {
                    return (
                        '<div class="form-check"> <input class="form-check-input dt-checkboxes is-checkbox-delete" type="checkbox" data-id="' + data + '" /><label class="form-check-label" for="checkbox' + data + '"></label></div>'
                    );
                },
                checkboxes: {
                    selectAllRender: '<div class="form-check"> <input class="form-check-input" type="checkbox" value="" id="checkboxSelectAll" /><label class="form-check-label" for="checkboxSelectAll"></label></div>'
                }
            },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return 'Details';
                        }
                    }),
                    type: 'column',
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                                ?
                                '<tr data-dt-row="' +
                                col.rowIdx +
                                '" data-dt-column="' +
                                col.columnIndex +
                                '">' +
                                '<td>' +
                                col.title +
                                ':' +
                                '</td> ' +
                                '<td>' +
                                col.data +
                                '</td>' +
                                '</tr>' :
                                '';
                        }).join('');

                        return data ? $('<table class="table"/>').append('<tbody>' + data + '</tbody>') : false;
                    }
                }
            },
            dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-end"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            displayLength: 7,
            lengthMenu: [7, 10, 25, 50, 75, 100],
            buttons: btn,
        });
        $('div.head-label').html('<h6 class="mb-0">' + head_label + '</h6>');

        $('.is-button-delete').on('click', function () {
            var id = [];
            $('.is-checkbox-delete:checked').each(function (i) {
                id[i] = $(this).data('id');
            });
            if (id.length === 0) {
                Swal.fire({
                    text: 'Please select at least one checkbox',
                    icon: 'warning',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                });
            } else {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, delete it!',
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-outline-danger ms-1'
                    },
                    buttonsStyling: false
                }).then(function (result) {
                    if (result.value) {
                        $.ajax({
                            url: url_action,
                            method: 'POST',
                            data: {
                                id: id
                            },
                            success: function (data) {
                                if (data.status) {
                                    $(table).DataTable().ajax.reload();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Deleted!',
                                        text: 'Your file has been deleted.',
                                        customClass: {
                                            confirmButton: 'btn btn-success'
                                        }
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: 'Something went wrong!',
                                        customClass: {
                                            confirmButton: 'btn btn-success'
                                        }
                                    });
                                }
                            }
                        });

                    }
                });
            }
        });

    });
}



function datatables_velixs({ table, json_url, delete_url, columns, btn = null, head_label = 'List' }) {
    if (btn == null) {
        btn = [{
            text: feather.icons['trash'].toSvg({
                class: 'me-50 font-small-4'
            }) + 'Delete',
            className: 'btn btn-outline-danger is-button-delete',
        }, {
            text: feather.icons['plus'].toSvg({
                class: 'me-50 font-small-4'
            }) + 'Add New',
            className: 'create-new btn btn-primary',
            attr: {
                'data-bs-toggle': 'modal',
                'data-bs-target': '#modalsaddnew'
            }
        }]
    }
    $(document).ready(function () {
        var dt_basic_table = $(table);
        if (dt_basic_table.length) {
            var dt_basic = dt_basic_table.DataTable({
                ajax: json_url,
                columns: columns,
                language: {
                    paginate: {
                        // remove previous & next text from pagination
                        previous: '&nbsp;',
                        next: '&nbsp;'
                    }
                },
                columnDefs: [{
                    // For Responsive
                    className: 'control',
                    orderable: false,
                    responsivePriority: 2,
                    targets: 0
                },
                {
                    // For Checkboxes
                    targets: 1,
                    orderable: false,
                    responsivePriority: 3,
                    render: function (data, type, full, meta) {
                        return (
                            '<div class="form-check"> <input class="form-check-input dt-checkboxes is-checkbox-delete" type="checkbox" data-id="' + data + '" /><label class="form-check-label" for="checkbox' + data + '"></label></div>'
                        );
                    },
                    checkboxes: {
                        selectAllRender: '<div class="form-check"> <input class="form-check-input" type="checkbox" value="" id="checkboxSelectAll" /><label class="form-check-label" for="checkboxSelectAll"></label></div>'
                    }
                },
                ],
                responsive: {
                    details: {
                        display: $.fn.dataTable.Responsive.display.modal({
                            header: function (row) {
                                var data = row.data();
                                return 'Details';
                            }
                        }),
                        type: 'column',
                        renderer: function (api, rowIdx, columns) {
                            var data = $.map(columns, function (col, i) {
                                return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                                    ?
                                    '<tr data-dt-row="' +
                                    col.rowIdx +
                                    '" data-dt-column="' +
                                    col.columnIndex +
                                    '">' +
                                    '<td>' +
                                    col.title +
                                    ':' +
                                    '</td> ' +
                                    '<td>' +
                                    col.data +
                                    '</td>' +
                                    '</tr>' :
                                    '';
                            }).join('');

                            return data ? $('<table class="table"/>').append('<tbody>' + data + '</tbody>') : false;
                        }
                    }
                },
                dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-end"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                displayLength: 7,
                lengthMenu: [7, 10, 25, 50, 75, 100],
                buttons: btn,

            });
            $('div.head-label').html('<h6 class="mb-0">' + head_label + '</h6>');
        }
        $('.is-button-delete').on('click', function () {
            var id = [];
            $('.is-checkbox-delete:checked').each(function (i) {
                id[i] = $(this).data('id');
            });
            if (id.length === 0) {
                Swal.fire({
                    text: 'Please select at least one checkbox',
                    icon: 'warning',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                });
            } else {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, delete it!',
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-outline-danger ms-1'
                    },
                    buttonsStyling: false
                }).then(function (result) {
                    if (result.value) {
                        $.ajax({
                            url: delete_url,
                            method: 'POST',
                            data: {
                                id: id
                            },
                            success: function (data) {
                                if (data.status) {
                                    $(table).DataTable().ajax.reload();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Deleted!',
                                        text: 'Your file has been deleted.',
                                        customClass: {
                                            confirmButton: 'btn btn-success'
                                        }
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: 'Something went wrong!',
                                        customClass: {
                                            confirmButton: 'btn btn-success'
                                        }
                                    });
                                }
                            }
                        });

                    }
                });
            }
        });
    });
}