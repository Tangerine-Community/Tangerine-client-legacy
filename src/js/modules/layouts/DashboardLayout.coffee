DashboardLayout = Backbone.Marionette.LayoutView.extend
    template: JST["src/templates/DashboardLayout.handlebars"],
    regions:
        dashboardRegion: "#dashboard-region",
        contentRegion: "#content-region"

