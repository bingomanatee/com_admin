angular.module('statics', ['staticsServices'])
    .filter('sid',
    function () {
        return  function (id) {
            return id.slice(0, 5) + '...';
        }
    }).filter('by_tag', function () {
        return function (items, tag) {
            return _.filter(items, function (s) {
                return _.include(s.tags, tag);
            })
        }
    });

function StaticsCtrl($scope, $filter) {

    $scope.colspan = 5;

    $scope.statics = static_data;

    console.log('$filter: ', $filter);

    $scope.max_tags = 3;
    $scope.draw_size=1;

    $scope.orderProp = "name";

    $scope.static_data = false;

    $scope.view_files = function (r) {
        $scope.active_route = r;
        $scope.show_files = true;
    }

    $scope.set_current_file = function (file) {
        console.log('current file: ', file, $scope.active_route);
        $scope.file_preview_url = $scope.active_route.prefix + '/' + file;
    }

}

StaticsCtrl.$inject = ['$scope', '$filter', 'Statics'];
