DashboardLayout = Backbone.Marionette.LayoutView.extend
    template: JST["src/templates/DashboardLayout.handlebars"],
    regions:
        headerRegion: "#header-region",
        contentRegion: "#content-region"
        footerRegion: "#footer-region"
