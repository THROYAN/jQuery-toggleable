jQuery-toggleable
=================

jQuery plugin for make things be able to toggle (in many ways and senses).

Overview
-----------------
Plugin allows to make simple toggle element like


    <div class="my-toggleable">
        <!-- caption -->
        <div> Click to toggle </div>
        <!-- context -->
        <div>I'm something to hide or show</div>
    </div>
    <script type="text/javascript">
        $('.my-toggleable').toggleable();
    </script>

or sometimes you need to integrate this feature to code, that don't looks like so simple... You can make any element to be a caption to any another element, that will be a context. So if you has something like this

    <table class="users">
        <tr>
            <td>Id</id>
            <td>Name</id>
        </tr>
        <tr>
            <td class="caption" colspan="2">Users</td>
        </tr>
        <tr>
            <td>1</td>
            <td>Eric</td>
        </tr>
        <tr>
            <td>2</td>
            <td>Nathan</td>
        </tr>
        <tr>
            <td class="caption" colspan="2">Admins</td>
        </tr>
            <td>3</td>
            <td>Svinota</td>
        </tr>
    </table>

you still can to make labels "Users" and "Admins" to toggle users bellow they using next:

    <script type="text/javascript">
        $('.users .caption').toggleable(function() {
            var $p = $(this).parent().next(),
                context = [];

            while ($p.size() > 0 && $p.find('.caption').size() == 0) {
                context.push($p);
                $p = $p.next();
            }
            return context;
        });
    </script>

It is not only allow multiple context, it is possible to make toggleable tree (not in mean of DOM and in mean of links relation, don't care) with opportunity to toggle all.

With small modules you can to add popup functionality to your toggleable:

    <script type="text/javascript">
        $('.my-popup').toggleable({
            modal: true,
        });
    </script>