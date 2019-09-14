    function init_code_hierarchy_plot(element_id, data) {
        var plot = document.getElementById(element_id);

        while (plot.hasChildNodes()) {
            plot.removeChild(plot.firstChild);
        }

        var width = plot.offsetWidth;
        var height = width;
        var name_index = 0;
        var count_index = 1;
        var children_index = 3;

        var max_depth = 3;

        var data_slices = [];
        var max_level = 6;
        var color = d3.scale.category20c();

        var svg = d3.select("#" + element_id).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        function process_data(data, level, start_deg, stop_deg) {
            var name = data[0];
            var total = data[1];
            var children = data[3];
            var current_deg = start_deg;
            if (level > max_level) {
                return;
            }
            if (start_deg == stop_deg) {
                return;
            }
            data_slices.push([start_deg, stop_deg, name, level, data[1], data[2]]);
            for (var key in children) {
                child = children[key];
                var inc_deg = (stop_deg - start_deg) / total * child[count_index];
                var child_start_deg = current_deg;
                current_deg += inc_deg;
                var child_stop_deg = current_deg;
                var span_deg = child_stop_deg - child_start_deg;
                process_data(child, level + 1, child_start_deg, child_stop_deg);
            }
        }

        process_data(data, 0, 0, 360. / 180.0 * Math.PI);

        var ref = data_slices[0];
        var next_ref = ref;
        var last_refs = [];

        var thickness = width / 2.0 / (max_level + 2) * 1.1;

        var arc = d3.svg.arc()
                .startAngle(function (d) {
                    if (d[3] == 0) {
                        return d[0];
                    }
                    return d[0] + 0.01;
                })
                .endAngle(function (d) {
                    if (d[3] == 0) {
                        return d[1];
                    }
                    return d[1] - 0.01;
                })
                .innerRadius(function (d) {
                    return 1.1 * d[3] * thickness;
                })
                .outerRadius(function (d) {
                    return (1.1 * d[3] + 1) * thickness;
                });

        var slices = svg.selectAll(".form")
                .data(function (d) {
                    return data_slices;
                })
                .enter()
                .append("g");
        slices.append("path")
                .attr("d", arc)
                .attr("id", function (d, i) {
                    return element_id + i;
                })
                .style("fill", function (d) {
                    return color(d[2]);
                })
                .on("click", animate)
                .on("mouseover", update_legend)
                .on("mouseout", remove_legend)
                .attr("class", "form")
                .append("svg:title")
                .text(function (d) {
                    return d[2] + "," + d[3];
                });

        /*    slices.append("text")
         .style("font-size", "10px")
         .append("textPath")
         .attr("xlink:href",function(d,i){return "#"+element_id+i;})
         .text(function(d){return d[2]})
         .attr("pointer-events","none")*/

        var legend = d3.select("#" + element_id + "_legend")

        function update_legend(d) {
            legend.html("<b>" + d[2] + ": </b><span>" + d[5] + " LOC</span>");
            legend.transition().duration(200).style("opacity", "1");
        }

        function remove_legend(d) {
            legend.transition().duration(1000).style("opacity", "0");
    //        legend.html("<h2>&nbsp;</h2>")
        }

        function get_start_angle(d, ref) {
            if (ref) {
                var ref_span = ref[1] - ref[0];
                return (d[0] - ref[0]) / ref_span * Math.PI * 2.0
            }
            else {
                return d[0];
            }
        }

        function get_stop_angle(d, ref) {
            if (ref) {
                var ref_span = ref[1] - ref[0];
                return (d[1] - ref[0]) / ref_span * Math.PI * 2.0
            }
            else {
                return d[0];
            }
        }

        function get_level(d, ref) {
            if (ref) {
                return d[3] - ref[3];
            }
            else {
                return d[3];
            }
        }

        function rebaseTween(new_ref) {
            return function (d) {
                var level = d3.interpolate(get_level(d, ref), get_level(d, new_ref));
                var start_deg = d3.interpolate(get_start_angle(d, ref), get_start_angle(d, new_ref));
                var stop_deg = d3.interpolate(get_stop_angle(d, ref), get_stop_angle(d, new_ref));
                var opacity = d3.interpolate(100, 0);
                return function (t) {
                    return arc([start_deg(t), stop_deg(t), d[2], level(t)]);
                }
            }
        }

        var animating = false;

        function animate(d) {
            if (animating) {
                return;
            }
            animating = true;
            var revert = false;
            var new_ref;
            if (d == ref && last_refs.length > 0) {
                revert = true;
                last_ref = last_refs.pop();
            }
            if (revert) {
                d = last_ref;
                new_ref = ref;
                svg.selectAll(".form")
                        .filter(
                        function (b) {
                            if (b[0] >= last_ref[0] && b[1] <= last_ref[1] && b[3] >= last_ref[3]) {
                                return true;
                            }
                            return false;
                        }
                )
                        .transition().duration(1000).style("opacity", "1").attr("pointer-events", "all");
            }
            else {
                new_ref = d;
                svg.selectAll(".form")
                        .filter(
                        function (b) {
                            if (b[0] < d[0] || b[1] > d[1] || b[3] < d[3]) {
                                return true;
                            }
                            return false;
                        }
                )
                        .transition().duration(1000).style("opacity", "0").attr("pointer-events", "none");
            }
            svg.selectAll(".form")
                    .filter(
                    function (b) {
                        if (b[0] >= new_ref[0] && b[1] <= new_ref[1] && b[3] >= new_ref[3]) {
                            return true;
                        }
                        return false;
                    }
            )
                    .transition().duration(1000).attrTween("d", rebaseTween(d));
            setTimeout(function () {
                animating = false;
                if (!revert) {
                    last_refs.push(ref);
                    ref = d;
                }
                else {
                    ref = d;
                }
            }, 1000);
        };

    }

    code_hierarchy_data1 = ["Project: github-android", 2208266, 61815, {
    "default-properties": ["default.properties", 138, 5, {}],
    "app": ["app", 2075305, 58258, {
        "src": ["src", 984607, 31604, {
            "main.java.com.github.mobile": ["main.java.com.github.mobile", 984607, 31604, {
                "core": ["core", 141198, 4823, {
                    "repo": ["repo", 16512, 531, {
                        "RepositoryUtils-java": ["RepositoryUtils.java", 3243, 89, {}],
                        "RepositoryUriMatcher-java": ["RepositoryUriMatcher.java", 1765, 58, {}],
                        "UnstarRepositoryTask-java": ["UnstarRepositoryTask.java", 2117, 78, {}],
                        "StarredRepositoryTask-java": ["StarredRepositoryTask.java", 1853, 64, {}],
                        "StarRepositoryTask-java": ["StarRepositoryTask.java", 2103, 78, {}],
                        "RepositoryEventMatcher-java": ["RepositoryEventMatcher.java", 3558, 100, {}],
                        "RefreshRepositoryTask-java": ["RefreshRepositoryTask.java", 1873, 64, {}]
                    }],
                    "search": ["search", 8189, 323, {
                        "SearchUserService-java": ["SearchUserService.java", 4803, 148, {}],
                        "SearchUser-java": ["SearchUser.java", 3386, 175, {}]
                    }],
                    "code": ["code", 11094, 364, {
                        "RefreshBlobTask-java": ["RefreshBlobTask.java", 1635, 58, {}],
                        "FullTree-java": ["FullTree.java", 5702, 192, {}],
                        "RefreshTreeTask-java": ["RefreshTreeTask.java", 3757, 114, {}]
                    }],
                    "gist": ["gist", 16952, 612, {
                        "GistUriMatcher-java": ["GistUriMatcher.java", 1707, 59, {}],
                        "StarGistTask-java": ["StarGistTask.java", 1736, 65, {}],
                        "RefreshGistTask-java": ["RefreshGistTask.java", 2665, 89, {}],
                        "GistEventMatcher-java": ["GistEventMatcher.java", 1541, 49, {}],
                        "GistStore-java": ["GistStore.java", 3102, 118, {}],
                        "GistUrlMatcher-java": ["GistUrlMatcher.java", 1417, 46, {}],
                        "FullGist-java": ["FullGist.java", 1792, 73, {}],
                        "UnstarGistTask-java": ["UnstarGistTask.java", 1750, 65, {}],
                        "GistPager-java": ["GistPager.java", 1242, 48, {}]
                    }],
                    "OnLoadListener-java": ["OnLoadListener.java", 825, 32, {}],
                    "issue": ["issue", 30468, 967, {
                        "IssueFilter-java": ["IssueFilter.java", 9062, 302, {}],
                        "IssueStore-java": ["IssueStore.java", 6725, 193, {}],
                        "RefreshIssueTask-java": ["RefreshIssueTask.java", 3253, 101, {}],
                        "FullIssue-java": ["FullIssue.java", 1534, 60, {}],
                        "IssueEventMatcher-java": ["IssueEventMatcher.java", 2099, 58, {}],
                        "IssueUrlMatcher-java": ["IssueUrlMatcher.java", 1584, 53, {}],
                        "IssueUriMatcher-java": ["IssueUriMatcher.java", 2423, 79, {}],
                        "IssuePager-java": ["IssuePager.java", 1355, 51, {}],
                        "IssueUtils-java": ["IssueUtils.java", 2433, 70, {}]
                    }],
                    "ItemStore-java": ["ItemStore.java", 2586, 95, {}],
                    "UrlMatcher-java": ["UrlMatcher.java", 1245, 41, {}],
                    "ResourcePager-java": ["ResourcePager.java", 4566, 175, {}],
                    "user": ["user", 15440, 554, {
                        "UnfollowUserTask-java": ["UnfollowUserTask.java", 2063, 78, {}],
                        "FollowUserTask-java": ["FollowUserTask.java", 2049, 78, {}],
                        "UserEventMatcher-java": ["UserEventMatcher.java", 2128, 76, {}],
                        "UserUrlMatcher-java": ["UserUrlMatcher.java", 1594, 54, {}],
                        "RefreshUserTask-java": ["RefreshUserTask.java", 1729, 63, {}],
                        "UserUriMatcher-java": ["UserUriMatcher.java", 1445, 51, {}],
                        "UserPager-java": ["UserPager.java", 940, 32, {}],
                        "FollowingUserTask-java": ["FollowingUserTask.java", 1755, 63, {}],
                        "UserComparator-java": ["UserComparator.java", 1737, 59, {}]
                    }],
                    "commit": ["commit", 29587, 996, {
                        "CommitPager-java": ["CommitPager.java", 1574, 54, {}],
                        "CommitUtils-java": ["CommitUtils.java", 8110, 285, {}],
                        "FullCommitFile-java": ["FullCommitFile.java", 2262, 84, {}],
                        "FullCommit-java": ["FullCommit.java", 4155, 131, {}],
                        "CommitCompareTask-java": ["CommitCompareTask.java", 2107, 73, {}],
                        "CommitMatch-java": ["CommitMatch.java", 1197, 46, {}],
                        "RefreshCommitTask-java": ["RefreshCommitTask.java", 3016, 94, {}],
                        "CommitUriMatcher-java": ["CommitUriMatcher.java", 2036, 66, {}],
                        "CommitStore-java": ["CommitStore.java", 3344, 105, {}],
                        "CommitUrlMatcher-java": ["CommitUrlMatcher.java", 1786, 58, {}]
                    }],
                    "ref": ["ref", 3734, 133, {
                        "RefUtils-java": ["RefUtils.java", 3734, 133, {}]
                    }]
                }],
                "ui": ["ui", 644530, 20280, {
                    "comment": ["comment", 15027, 507, {
                        "RawCommentFragment-java": ["RawCommentFragment.java", 2131, 69, {}],
                        "CommentListAdapter-java": ["CommentListAdapter.java", 2929, 97, {}],
                        "RenderedCommentFragment-java": ["RenderedCommentFragment.java", 3773, 116, {}],
                        "CommentPreviewPagerAdapter-java": ["CommentPreviewPagerAdapter.java", 2338, 86, {}],
                        "CreateCommentActivity-java": ["CreateCommentActivity.java", 3856, 139, {}]
                    }],
                    "code": ["code", 11113, 325, {
                        "RepositoryCodeFragment-java": ["RepositoryCodeFragment.java", 11113, 325, {}]
                    }],
                    "ProgressDialogTask-java": ["ProgressDialogTask.java", 2924, 114, {}],
                    "DialogResultListener-java": ["DialogResultListener.java", 1168, 37, {}],
                    "StyledText-java": ["StyledText.java", 5236, 190, {}],
                    "LightProgressDialog-java": ["LightProgressDialog.java", 2871, 85, {}],
                    "gist": ["gist", 71715, 2306, {
                        "PublicGistsFragment-java": ["PublicGistsFragment.java", 1264, 40, {}],
                        "DeleteGistTask-java": ["DeleteGistTask.java", 2400, 89, {}],
                        "CreateGistActivity-java": ["CreateGistActivity.java", 5001, 151, {}],
                        "GistsFragment-java": ["GistsFragment.java", 3312, 115, {}],
                        "CreateCommentActivity-java": ["CreateCommentActivity.java", 2339, 78, {}],
                        "CreateCommentTask-java": ["CreateCommentTask.java", 2508, 89, {}],
                        "GistFilesViewActivity-java": ["GistFilesViewActivity.java", 5406, 171, {}],
                        "GistsViewActivity-java": ["GistsViewActivity.java", 7109, 212, {}],
                        "GistFragment-java": ["GistFragment.java", 14066, 429, {}],
                        "RandomGistTask-java": ["RandomGistTask.java", 3181, 105, {}],
                        "GistsActivity-java": ["GistsActivity.java", 3187, 99, {}],
                        "MyGistsFragment-java": ["MyGistsFragment.java", 2045, 63, {}],
                        "GistListAdapter-java": ["GistListAdapter.java", 3318, 108, {}],
                        "StarredGistsFragment-java": ["StarredGistsFragment.java", 1259, 40, {}],
                        "CreateGistTask-java": ["CreateGistTask.java", 2786, 100, {}],
                        "GistsPagerAdapter-java": ["GistsPagerAdapter.java", 1622, 56, {}],
                        "GistQueriesPagerAdapter-java": ["GistQueriesPagerAdapter.java", 2083, 76, {}],
                        "GistFilesPagerAdapter-java": ["GistFilesPagerAdapter.java", 2137, 71, {}],
                        "GistFileFragment-java": ["GistFileFragment.java", 6692, 214, {}]
                    }],
                    "TextWatcherAdapter-java": ["TextWatcherAdapter.java", 1081, 36, {}],
                    "DialogFragmentHelper-java": ["DialogFragmentHelper.java", 4046, 144, {}],
                    "FragmentPagerAdapter-java": ["FragmentPagerAdapter.java", 1943, 65, {}],
                    "ItemListFragment-java": ["ItemListFragment.java", 13108, 464, {}],
                    "HeaderFooterListAdapter-java": ["HeaderFooterListAdapter.java", 5187, 187, {}],
                    "FragmentStatePagerAdapter-java": ["FragmentStatePagerAdapter.java", 1959, 66, {}],
                    "SingleChoiceDialogFragment-java": ["SingleChoiceDialogFragment.java", 2150, 70, {}],
                    "ref": ["ref", 25451, 799, {
                        "BranchFileViewActivity-java": ["BranchFileViewActivity.java", 10271, 305, {}],
                        "RefDialogFragment-java": ["RefDialogFragment.java", 5508, 171, {}],
                        "RefDialog-java": ["RefDialog.java", 4521, 142, {}],
                        "CodeTreeAdapter-java": ["CodeTreeAdapter.java", 5151, 181, {}]
                    }],
                    "NewsFragment-java": ["NewsFragment.java", 10555, 312, {}],
                    "FragmentProvider-java": ["FragmentProvider.java", 888, 32, {}],
                    "ConfirmDialogFragment-java": ["ConfirmDialogFragment.java", 3172, 93, {}],
                    "MarkdownLoader-java": ["MarkdownLoader.java", 2650, 92, {}],
                    "ResourceLoadingIndicator-java": ["ResourceLoadingIndicator.java", 2456, 84, {}],
                    "DialogFragment-java": ["DialogFragment.java", 2593, 89, {}],
                    "TabPagerActivity-java": ["TabPagerActivity.java", 6498, 224, {}],
                    "repo": ["repo", 57033, 1827, {
                        "RepositoryListAdapter-java": ["RepositoryListAdapter.java", 2880, 93, {}],
                        "UserRepositoryListFragment-java": ["UserRepositoryListFragment.java", 3613, 113, {}],
                        "DefaultRepositoryListAdapter-java": ["DefaultRepositoryListAdapter.java", 4451, 142, {}],
                        "ContributorListAdapter-java": ["ContributorListAdapter.java", 2130, 71, {}],
                        "UserRepositoryListAdapter-java": ["UserRepositoryListAdapter.java", 2992, 92, {}],
                        "OrganizationLoader-java": ["OrganizationLoader.java", 2624, 83, {}],
                        "RepositoryPagerAdapter-java": ["RepositoryPagerAdapter.java", 3883, 133, {}],
                        "RepositoryListFragment-java": ["RepositoryListFragment.java", 10276, 309, {}],
                        "RecentRepositories-java": ["RecentRepositories.java", 5570, 209, {}],
                        "RepositoryContributorsActivity-java": ["RepositoryContributorsActivity.java", 2778, 86, {}],
                        "RepositoryContributorsFragment-java": ["RepositoryContributorsFragment.java", 3458, 112, {}],
                        "RepositoryViewActivity-java": ["RepositoryViewActivity.java", 9601, 294, {}],
                        "RepositoryNewsFragment-java": ["RepositoryNewsFragment.java", 2777, 90, {}]
                    }],
                    "user": ["user", 83706, 2559, {
                        "UserPagerAdapter-java": ["UserPagerAdapter.java", 2281, 79, {}],
                        "UserListAdapter-java": ["UserListAdapter.java", 1842, 65, {}],
                        "NewsListAdapter-java": ["NewsListAdapter.java", 22246, 609, {}],
                        "UserFollowingFragment-java": ["UserFollowingFragment.java", 1570, 52, {}],
                        "EventPager-java": ["EventPager.java", 1090, 37, {}],
                        "HomeActivity-java": ["HomeActivity.java", 10610, 305, {}],
                        "UriLauncherActivity-java": ["UriLauncherActivity.java", 4940, 133, {}],
                        "UserFollowersFragment-java": ["UserFollowersFragment.java", 1546, 52, {}],
                        "FollowingFragment-java": ["FollowingFragment.java", 1262, 44, {}],
                        "OrganizationSelectionListener-java": ["OrganizationSelectionListener.java", 961, 31, {}],
                        "MyFollowersFragment-java": ["MyFollowersFragment.java", 1256, 39, {}],
                        "UserReceivedNewsFragment-java": ["UserReceivedNewsFragment.java", 1278, 40, {}],
                        "UserNewsFragment-java": ["UserNewsFragment.java", 3017, 97, {}],
                        "HomePagerAdapter-java": ["HomePagerAdapter.java", 4076, 135, {}],
                        "HomeDropdownListAdapter-java": ["HomeDropdownListAdapter.java", 5709, 206, {}],
                        "OrganizationSelectionProvider-java": ["OrganizationSelectionProvider.java", 1263, 42, {}],
                        "MembersFragment-java": ["MembersFragment.java", 3801, 116, {}],
                        "UserCreatedNewsFragment-java": ["UserCreatedNewsFragment.java", 1269, 40, {}],
                        "FollowersFragment-java": ["FollowersFragment.java", 1260, 44, {}],
                        "OrganizationNewsFragment-java": ["OrganizationNewsFragment.java", 1403, 42, {}],
                        "PagedUserFragment-java": ["PagedUserFragment.java", 1923, 63, {}],
                        "UserViewActivity-java": ["UserViewActivity.java", 7820, 248, {}],
                        "MyFollowingFragment-java": ["MyFollowingFragment.java", 1283, 40, {}]
                    }],
                    "WebView-java": ["WebView.java", 2464, 84, {}],
                    "search": ["search", 21432, 704, {
                        "SearchUserListAdapter-java": ["SearchUserListAdapter.java", 1929, 66, {}],
                        "SearchPagerAdapter-java": ["SearchPagerAdapter.java", 1948, 72, {}],
                        "SearchActivity-java": ["SearchActivity.java", 4905, 155, {}],
                        "SearchUserListFragment-java": ["SearchUserListFragment.java", 3347, 112, {}],
                        "SearchRepositoryListAdapter-java": ["SearchRepositoryListAdapter.java", 2688, 83, {}],
                        "RepositorySearchSuggestionsProvider-java": ["RepositorySearchSuggestionsProvider.java", 1814, 60, {}],
                        "SearchRepositoryListFragment-java": ["SearchRepositoryListFragment.java", 4801, 156, {}]
                    }],
                    "ViewPager-java": ["ViewPager.java", 3525, 120, {}],
                    "issue": ["issue", 181661, 5536, {
                        "FilterListFragment-java": ["FilterListFragment.java", 2882, 90, {}],
                        "IssueDashboardActivity-java": ["IssueDashboardActivity.java", 2842, 86, {}],
                        "EditIssuesFilterActivity-java": ["EditIssuesFilterActivity.java", 9245, 281, {}],
                        "EditAssigneeTask-java": ["EditAssigneeTask.java", 3077, 107, {}],
                        "CreateCommentActivity-java": ["CreateCommentActivity.java", 3179, 94, {}],
                        "MilestoneDialogFragment-java": ["MilestoneDialogFragment.java", 5716, 173, {}],
                        "IssuesPagerAdapter-java": ["IssuesPagerAdapter.java", 4900, 148, {}],
                        "FilterListAdapter-java": ["FilterListAdapter.java", 3191, 95, {}],
                        "DashboardIssueFragment-java": ["DashboardIssueFragment.java", 3913, 127, {}],
                        "RepositoryIssueListAdapter-java": ["RepositoryIssueListAdapter.java", 2831, 89, {}],
                        "IssueBrowseActivity-java": ["IssueBrowseActivity.java", 2880, 85, {}],
                        "IssueSearchActivity-java": ["IssueSearchActivity.java", 4192, 122, {}],
                        "SearchIssueListAdapter-java": ["SearchIssueListAdapter.java", 3128, 97, {}],
                        "MilestoneDialog-java": ["MilestoneDialog.java", 5409, 165, {}],
                        "IssueFragment-java": ["IssueFragment.java", 20790, 605, {}],
                        "EditMilestoneTask-java": ["EditMilestoneTask.java", 3154, 108, {}],
                        "LabelDrawableSpan-java": ["LabelDrawableSpan.java", 8586, 258, {}],
                        "EditLabelsTask-java": ["EditLabelsTask.java", 3034, 108, {}],
                        "DashboardIssueListAdapter-java": ["DashboardIssueListAdapter.java", 3237, 101, {}],
                        "FiltersViewActivity-java": ["FiltersViewActivity.java", 4390, 124, {}],
                        "CreateIssueTask-java": ["CreateIssueTask.java", 2469, 89, {}],
                        "IssuesFragment-java": ["IssuesFragment.java", 9684, 287, {}],
                        "LabelsDialogFragment-java": ["LabelsDialogFragment.java", 7040, 197, {}],
                        "CreateCommentTask-java": ["CreateCommentTask.java", 2866, 98, {}],
                        "IssueDashboardPagerAdapter-java": ["IssueDashboardPagerAdapter.java", 3763, 109, {}],
                        "IssuesViewActivity-java": ["IssuesViewActivity.java", 10747, 316, {}],
                        "AssigneeDialogFragment-java": ["AssigneeDialogFragment.java", 5537, 170, {}],
                        "EditIssueActivity-java": ["EditIssueActivity.java", 12691, 370, {}],
                        "EditStateTask-java": ["EditStateTask.java", 3446, 112, {}],
                        "IssueListAdapter-java": ["IssueListAdapter.java", 5110, 167, {}],
                        "LabelsDialog-java": ["LabelsDialog.java", 4858, 151, {}],
                        "AssigneeDialog-java": ["AssigneeDialog.java", 4667, 146, {}],
                        "SearchIssueListFragment-java": ["SearchIssueListFragment.java", 4358, 128, {}],
                        "EditIssueTask-java": ["EditIssueTask.java", 1996, 73, {}],
                        "IssueSearchSuggestionsProvider-java": ["IssueSearchSuggestionsProvider.java", 1853, 60, {}]
                    }],
                    "LightAlertDialog-java": ["LightAlertDialog.java", 2263, 76, {}],
                    "PagerActivity-java": ["PagerActivity.java", 2748, 95, {}],
                    "UrlLauncher-java": ["UrlLauncher.java", 5984, 175, {}],
                    "BaseActivity-java": ["BaseActivity.java", 2154, 83, {}],
                    "commit": ["commit", 80513, 2429, {
                        "CommitListFragment-java": ["CommitListFragment.java", 9302, 284, {}],
                        "DiffStyler-java": ["DiffStyler.java", 4153, 138, {}],
                        "CommitViewActivity-java": ["CommitViewActivity.java", 5064, 159, {}],
                        "CreateCommentTask-java": ["CreateCommentTask.java", 2802, 95, {}],
                        "CommitFileListAdapter-java": ["CommitFileListAdapter.java", 6984, 215, {}],
                        "CreateCommentActivity-java": ["CreateCommentActivity.java", 4007, 122, {}],
                        "CommitCompareListFragment-java": ["CommitCompareListFragment.java", 9664, 276, {}],
                        "CommitDiffListFragment-java": ["CommitDiffListFragment.java", 17886, 516, {}],
                        "CommitPagerAdapter-java": ["CommitPagerAdapter.java", 1966, 65, {}],
                        "CommitListAdapter-java": ["CommitListAdapter.java", 2924, 94, {}],
                        "CommitFileViewActivity-java": ["CommitFileViewActivity.java", 10655, 312, {}],
                        "CommitFileComparator-java": ["CommitFileComparator.java", 1408, 44, {}],
                        "CommitCompareViewActivity-java": ["CommitCompareViewActivity.java", 3698, 109, {}]
                    }],
                    "DialogFragmentActivity-java": ["DialogFragmentActivity.java", 3217, 122, {}],
                    "PagedItemFragment-java": ["PagedItemFragment.java", 4039, 149, {}]
                }],
                "RequestFuture-java": ["RequestFuture.java", 936, 33, {}],
                "Intents-java": ["Intents.java", 9594, 352, {}],
                "sync": ["sync", 8732, 308, {
                    "SyncCampaign-java": ["SyncCampaign.java", 3463, 121, {}],
                    "SyncAdapterService-java": ["SyncAdapterService.java", 1142, 38, {}],
                    "ContentProviderAdapter-java": ["ContentProviderAdapter.java", 1619, 60, {}],
                    "SyncAdapter-java": ["SyncAdapter.java", 2508, 89, {}]
                }],
                "RequestCodes-java": ["RequestCodes.java", 2001, 98, {}],
                "util": ["util", 75631, 2528, {
                    "TimeUtils-java": ["TimeUtils.java", 1589, 47, {}],
                    "AvatarLoader-java": ["AvatarLoader.java", 13941, 463, {}],
                    "HtmlUtils-java": ["HtmlUtils.java", 17294, 511, {}],
                    "PreferenceUtils-java": ["PreferenceUtils.java", 1910, 66, {}],
                    "ServiceUtils-java": ["ServiceUtils.java", 3478, 132, {}],
                    "ImageUtils-java": ["ImageUtils.java", 7684, 258, {}],
                    "TypefaceUtils-java": ["TypefaceUtils.java", 5728, 243, {}],
                    "ShareUtils-java": ["ShareUtils.java", 1933, 66, {}],
                    "HttpImageGetter-java": ["HttpImageGetter.java", 10085, 301, {}],
                    "SourceEditor-java": ["SourceEditor.java", 5462, 211, {}],
                    "MarkdownUtils-java": ["MarkdownUtils.java", 1410, 47, {}],
                    "GravatarUtils-java": ["GravatarUtils.java", 2643, 96, {}],
                    "ToastUtils-java": ["ToastUtils.java", 2474, 87, {}]
                }],
                "DefaultClient-java": ["DefaultClient.java", 1683, 60, {}],
                "ThrowableLoader-java": ["ThrowableLoader.java", 2578, 100, {}],
                "accounts": ["accounts", 54976, 1655, {
                    "AccountConstants-java": ["AccountConstants.java", 1187, 48, {}],
                    "AuthenticatedUserLoader-java": ["AuthenticatedUserLoader.java", 2729, 102, {}],
                    "LoginActivity-java": ["LoginActivity.java", 15213, 436, {}],
                    "AccountUtils-java": ["AccountUtils.java", 12600, 355, {}],
                    "GitHubAccount-java": ["GitHubAccount.java", 2616, 96, {}],
                    "AccountAuthenticatorService-java": ["AccountAuthenticatorService.java", 1416, 41, {}],
                    "ScopeBase-java": ["ScopeBase.java", 2219, 70, {}],
                    "AccountClient-java": ["AccountClient.java", 2073, 67, {}],
                    "AccountScope-java": ["AccountScope.java", 3531, 111, {}],
                    "AccountAuthenticator-java": ["AccountAuthenticator.java", 8332, 224, {}],
                    "AuthenticatedUserTask-java": ["AuthenticatedUserTask.java", 3060, 105, {}]
                }],
                "RequestReader-java": ["RequestReader.java", 3352, 109, {}],
                "GitHubModule-java": ["GitHubModule.java", 3532, 105, {}],
                "RequestWriter-java": ["RequestWriter.java", 2961, 99, {}],
                "ResultCodes-java": ["ResultCodes.java", 866, 30, {}],
                "persistence": ["persistence", 28023, 888, {
                    "PersistableResource-java": ["PersistableResource.java", 1792, 63, {}],
                    "OrganizationRepositories-java": ["OrganizationRepositories.java", 6670, 192, {}],
                    "DatabaseCache-java": ["DatabaseCache.java", 4878, 160, {}],
                    "Organizations-java": ["Organizations.java", 3223, 102, {}],
                    "CacheHelper-java": ["CacheHelper.java", 2151, 63, {}],
                    "AccountDataManager-java": ["AccountDataManager.java", 9309, 308, {}]
                }],
                "ServicesModule-java": ["ServicesModule.java", 4014, 136, {}]
            }]
        }],
        "-project": [".project", 853, 34, {}],
        "assets": ["assets", 556292, 15254, {
            "source-editor-css": ["source-editor.css", 365, 25, {}],
            "VERSION-code-mirror": ["VERSION-code-mirror", 5, 1, {}],
            "LICENSE": ["LICENSE", 1251, 24, {}],
            "octicons-regular-webfont-ttf": ["octicons-regular-webfont.ttf", 51, 51, {}],
            "trans_bg-gif": ["trans_bg.gif", 0, 0, {}],
            "lib": ["lib", 142520, 3453, {
                "util": ["util", 4083, 112, {
                    "loadmode-js": ["loadmode.js", 1838, 52, {}],
                    "overlay-js": ["overlay.js", 2245, 60, {}]
                }],
                "codemirror-js": ["codemirror.js", 133666, 3166, {}],
                "codemirror-css": ["codemirror.css", 4771, 175, {}]
            }],
            "mode": ["mode", 407676, 11513, {
                "vb": ["vb", 9671, 283, {
                    "LICENSE-txt": ["LICENSE.txt", 1134, 22, {}],
                    "vb-js": ["vb.js", 8537, 261, {}]
                }],
                "markdown": ["markdown", 14207, 482, {
                    "markdown-js": ["markdown.js", 14207, 482, {}]
                }],
                "less": ["less", 1, 1, {
                    "less-js": ["less.js", 1, 1, {}]
                }],
                "commonlisp": ["commonlisp", 3634, 102, {
                    "commonlisp-js": ["commonlisp.js", 3634, 102, {}]
                }],
                "mysql": ["mysql", 7983, 187, {
                    "mysql-js": ["mysql.js", 7983, 187, {}]
                }],
                "tiddlywiki": ["tiddlywiki", 10103, 400, {
                    "tiddlywiki-css": ["tiddlywiki.css", 234, 15, {}],
                    "tiddlywiki-js": ["tiddlywiki.js", 9869, 385, {}]
                }],
                "pig": ["pig", 5406, 173, {
                    "pig-js": ["pig.js", 5406, 173, {}]
                }],
                "pascal": ["pascal", 3789, 103, {
                    "pascal-js": ["pascal.js", 2704, 95, {}],
                    "LICENSE": ["LICENSE", 1085, 8, {}]
                }],
                "haskell": ["haskell", 7722, 243, {
                    "haskell-js": ["haskell.js", 7722, 243, {}]
                }],
                "gfm": ["gfm", 2936, 95, {
                    "gfm-js": ["gfm.js", 2936, 95, {}]
                }],
                "go": ["go", 5647, 171, {
                    "go-js": ["go.js", 5647, 171, {}]
                }],
                "diff": ["diff", 702, 33, {
                    "diff-js": ["diff.js", 702, 33, {}]
                }],
                "rpm": ["rpm", 3709, 93, {
                    "changes": ["changes", 673, 20, {
                        "changes-js": ["changes.js", 673, 20, {}]
                    }],
                    "spec": ["spec", 3036, 73, {
                        "spec-css": ["spec.css", 272, 6, {}],
                        "spec-js": ["spec.js", 2764, 67, {}]
                    }]
                }],
                "smalltalk": ["smalltalk", 3588, 139, {
                    "smalltalk-js": ["smalltalk.js", 3588, 139, {}]
                }],
                "ntriples": ["ntriples", 6533, 173, {
                    "ntriples-js": ["ntriples.js", 6533, 173, {}]
                }],
                "xml": ["xml", 10228, 319, {
                    "xml-js": ["xml.js", 10228, 319, {}]
                }],
                "sieve": ["sieve", 4803, 181, {
                    "LICENSE": ["LICENSE", 1249, 24, {}],
                    "sieve-js": ["sieve.js", 3554, 157, {}]
                }],
                "yaml": ["yaml", 2772, 96, {
                    "yaml-js": ["yaml.js", 2772, 96, {}]
                }],
                "vbscript": ["vbscript", 0, 0, {
                    "vbscript-js": ["vbscript.js", 0, 0, {}]
                }],
                "perl": ["perl", 31358, 837, {
                    "perl-js": ["perl.js", 30245, 817, {}],
                    "LICENSE": ["LICENSE", 1113, 20, {}]
                }],
                "coffeescript": ["coffeescript", 12444, 369, {
                    "coffeescript-js": ["coffeescript.js", 11272, 347, {}],
                    "LICENSE": ["LICENSE", 1172, 22, {}]
                }],
                "verilog": ["verilog", 7001, 195, {
                    "verilog-js": ["verilog.js", 7001, 195, {}]
                }],
                "haxe": ["haxe", 15621, 430, {
                    "haxe-js": ["haxe.js", 15621, 430, {}]
                }],
                "scheme": ["scheme", 13194, 231, {
                    "scheme-js": ["scheme.js", 13194, 231, {}]
                }],
                "css": ["css", 22067, 449, {
                    "css-js": ["css.js", 22067, 449, {}]
                }],
                "htmlmixed": ["htmlmixed", 3065, 85, {
                    "htmlmixed-js": ["htmlmixed.js", 3065, 85, {}]
                }],
                "shell": ["shell", 3330, 119, {
                    "shell-js": ["shell.js", 3330, 119, {}]
                }],
                "plsql": ["plsql", 8649, 218, {
                    "plsql-js": ["plsql.js", 8649, 218, {}]
                }],
                "python": ["python", 13579, 360, {
                    "LICENSE-txt": ["LICENSE.txt", 1095, 21, {}],
                    "python-js": ["python.js", 12484, 339, {}]
                }],
                "ecl": ["ecl", 8727, 204, {
                    "ecl-js": ["ecl.js", 8727, 204, {}]
                }],
                "jinja2": ["jinja2", 1422, 43, {
                    "jinja2-js": ["jinja2.js", 1422, 43, {}]
                }],
                "smarty": ["smarty", 4001, 148, {
                    "smarty-js": ["smarty.js", 4001, 148, {}]
                }],
                "rst": ["rst", 8765, 327, {
                    "rst-js": ["rst.js", 8765, 327, {}]
                }],
                "htmlembedded": ["htmlembedded", 2664, 74, {
                    "htmlembedded-js": ["htmlembedded.js", 2664, 74, {}]
                }],
                "stex": ["stex", 4713, 183, {
                    "stex-js": ["stex.js", 4713, 183, {}]
                }],
                "php": ["php", 6252, 149, {
                    "php-js": ["php.js", 6252, 149, {}]
                }],
                "ruby": ["ruby", 9003, 221, {
                    "ruby-js": ["ruby.js", 7492, 196, {}],
                    "LICENSE": ["LICENSE", 1511, 25, {}]
                }],
                "properties": ["properties", 1797, 64, {
                    "properties-js": ["properties.js", 1797, 64, {}]
                }],
                "groovy": ["groovy", 7369, 211, {
                    "groovy-js": ["groovy.js", 7369, 211, {}]
                }],
                "erlang": ["erlang", 13767, 464, {
                    "erlang-js": ["erlang.js", 13767, 464, {}]
                }],
                "sparql": ["sparql", 4748, 144, {
                    "sparql-js": ["sparql.js", 4748, 144, {}]
                }],
                "clike": ["clike", 11101, 286, {
                    "clike-js": ["clike.js", 11101, 286, {}]
                }],
                "ocaml": ["ocaml", 2836, 115, {
                    "ocaml-js": ["ocaml.js", 2836, 115, {}]
                }],
                "tiki": ["tiki", 8596, 336, {
                    "tiki-js": ["tiki.js", 8125, 310, {}],
                    "tiki-css": ["tiki.css", 471, 26, {}]
                }],
                "xquery": ["xquery", 17607, 472, {
                    "xquery-js": ["xquery.js", 16479, 452, {}],
                    "LICENSE": ["LICENSE", 1128, 20, {}]
                }],
                "r": ["r", 6587, 167, {
                    "r-js": ["r.js", 5077, 142, {}],
                    "LICENSE": ["LICENSE", 1510, 25, {}]
                }],
                "javascript": ["javascript", 14807, 410, {
                    "javascript-js": ["javascript.js", 14807, 410, {}]
                }],
                "velocity": ["velocity", 5106, 147, {
                    "velocity-js": ["velocity.js", 5106, 147, {}]
                }],
                "clojure": ["clojure", 12671, 207, {
                    "clojure-js": ["clojure.js", 12671, 207, {}]
                }],
                "lua": ["lua", 5506, 141, {
                    "lua-js": ["lua.js", 5506, 141, {}]
                }],
                "rust": ["rust", 15889, 433, {
                    "rust-js": ["rust.js", 15889, 433, {}]
                }]
            }],
            "source-editor-html": ["source-editor.html", 375, 13, {}],
            "source-editor-js": ["source-editor.js", 4049, 174, {}]
        }],
        "AndroidManifest-xml": ["AndroidManifest.xml", 14801, 364, {}],
        "pom-xml": ["pom.xml", 6662, 207, {}],
        "project-properties": ["project.properties", 240, 7, {}],
        "-settings": [".settings", 28251, 364, {
            "org-eclipse-jdt-core-prefs": ["org.eclipse.jdt.core.prefs", 25431, 306, {}],
            "org-eclipse-jdt-ui-prefs": ["org.eclipse.jdt.ui.prefs", 2820, 58, {}]
        }],
        "res": ["res", 483223, 10414, {
            "drawable-mdpi": ["drawable-mdpi", 33, 33, {
                "menu_random-png": ["menu_random.png", 2, 2, {}],
                "menu_bookmark-png": ["menu_bookmark.png", 1, 1, {}],
                "menu_delete_history-png": ["menu_delete_history.png", 2, 2, {}],
                "menu_issue_close-png": ["menu_issue_close.png", 2, 2, {}],
                "menu_delete-png": ["menu_delete.png", 2, 2, {}],
                "menu_share-png": ["menu_share.png", 1, 1, {}],
                "action_create-png": ["action_create.png", 0, 0, {}],
                "menu_filter-png": ["menu_filter.png", 1, 1, {}],
                "menu_issue_reopen-png": ["menu_issue_reopen.png", 2, 2, {}],
                "action_refresh-png": ["action_refresh.png", 0, 0, {}],
                "action_dashboard-png": ["action_dashboard.png", 1, 1, {}],
                "app_icon-png": ["app_icon.png", 4, 4, {}],
                "action_search-png": ["action_search.png", 1, 1, {}],
                "menu_star-png": ["menu_star.png", 2, 2, {}],
                "action_bookmark-png": ["action_bookmark.png", 1, 1, {}],
                "menu_refresh-png": ["menu_refresh.png", 2, 2, {}],
                "menu_issue_open-png": ["menu_issue_open.png", 2, 2, {}],
                "action_save-png": ["action_save.png", 3, 3, {}],
                "action_comment-png": ["action_comment.png", 1, 1, {}],
                "action_gist-png": ["action_gist.png", 1, 1, {}],
                "menu_edit-png": ["menu_edit.png", 2, 2, {}]
            }],
            "values-es": ["values-es", 15131, 265, {
                "strings-xml": ["strings.xml", 15131, 265, {}]
            }],
            "color": ["color", 1694, 44, {
                "tab_icon_colors-xml": ["tab_icon_colors.xml", 847, 22, {}],
                "tab_text_colors-xml": ["tab_text_colors.xml", 847, 22, {}]
            }],
            "drawable-hdpi": ["drawable-hdpi", 49, 49, {
                "menu_random-png": ["menu_random.png", 3, 3, {}],
                "menu_bookmark-png": ["menu_bookmark.png", 2, 2, {}],
                "menu_delete_history-png": ["menu_delete_history.png", 4, 4, {}],
                "menu_issue_close-png": ["menu_issue_close.png", 4, 4, {}],
                "menu_delete-png": ["menu_delete.png", 2, 2, {}],
                "menu_share-png": ["menu_share.png", 2, 2, {}],
                "action_create-png": ["action_create.png", 0, 0, {}],
                "menu_filter-png": ["menu_filter.png", 2, 2, {}],
                "menu_issue_reopen-png": ["menu_issue_reopen.png", 3, 3, {}],
                "action_refresh-png": ["action_refresh.png", 1, 1, {}],
                "action_dashboard-png": ["action_dashboard.png", 1, 1, {}],
                "app_icon-png": ["app_icon.png", 7, 7, {}],
                "action_search-png": ["action_search.png", 1, 1, {}],
                "menu_star-png": ["menu_star.png", 3, 3, {}],
                "action_bookmark-png": ["action_bookmark.png", 1, 1, {}],
                "menu_refresh-png": ["menu_refresh.png", 3, 3, {}],
                "menu_issue_open-png": ["menu_issue_open.png", 3, 3, {}],
                "action_save-png": ["action_save.png", 3, 3, {}],
                "action_comment-png": ["action_comment.png", 1, 1, {}],
                "action_gist-png": ["action_gist.png", 1, 1, {}],
                "menu_edit-png": ["menu_edit.png", 2, 2, {}]
            }],
            "drawable-nodpi": ["drawable-nodpi", 24, 24, {
                "tab_selected-9-png": ["tab_selected.9.png", 0, 0, {}],
                "gravatar_icon-png": ["gravatar_icon.png", 2, 2, {}],
                "spinner_outer-png": ["spinner_outer.png", 10, 10, {}],
                "tab_left-9-png": ["tab_left.9.png", 0, 0, {}],
                "dropdown_dashboard-png": ["dropdown_dashboard.png", 3, 3, {}],
                "tab_right-9-png": ["tab_right.9.png", 0, 0, {}],
                "image_loading_icon-png": ["image_loading_icon.png", 0, 0, {}],
                "dropdown_gist-png": ["dropdown_gist.png", 1, 1, {}],
                "tab_left_right-9-png": ["tab_left_right.9.png", 0, 0, {}],
                "spinner_inner-png": ["spinner_inner.png", 7, 7, {}],
                "dropdown_bookmark-png": ["dropdown_bookmark.png", 1, 1, {}]
            }],
            "values-el": ["values-el", 18903, 265, {
                "strings-xml": ["strings.xml", 18903, 265, {}]
            }],
            "values-zh-rCN": ["values-zh-rCN", 14489, 262, {
                "strings-xml": ["strings.xml", 14489, 262, {}]
            }],
            "xml": ["xml", 3638, 89, {
                "authenticator-xml": ["authenticator.xml", 877, 22, {}],
                "sync_adapter-xml": ["sync_adapter.xml", 834, 21, {}],
                "searchable_issues-xml": ["searchable_issues.xml", 974, 23, {}],
                "searchable_repos_users-xml": ["searchable_repos_users.xml", 953, 23, {}]
            }],
            "values-sk": ["values-sk", 14664, 254, {
                "strings-xml": ["strings.xml", 14664, 254, {}]
            }],
            "menu": ["menu", 18327, 523, {
                "commit_view-xml": ["commit_view.xml", 1236, 35, {}],
                "issue_view-xml": ["issue_view.xml", 1579, 45, {}],
                "issue_filter-xml": ["issue_filter.xml", 882, 25, {}],
                "user_follow-xml": ["user_follow.xml", 839, 24, {}],
                "home-xml": ["home.xml", 898, 25, {}],
                "gist_view-xml": ["gist_view.xml", 1576, 45, {}],
                "comment-xml": ["comment.xml", 918, 26, {}],
                "search-xml": ["search.xml", 1092, 30, {}],
                "gist_create-xml": ["gist_create.xml", 884, 25, {}],
                "code_view-xml": ["code_view.xml", 845, 24, {}],
                "refresh-xml": ["refresh.xml", 887, 25, {}],
                "repository-xml": ["repository.xml", 1068, 33, {}],
                "issue_edit-xml": ["issue_edit.xml", 915, 26, {}],
                "file_view-xml": ["file_view.xml", 1172, 35, {}],
                "login-xml": ["login.xml", 871, 25, {}],
                "issues-xml": ["issues.xml", 1600, 45, {}],
                "gists-xml": ["gists.xml", 1065, 30, {}]
            }],
            "values-uk": ["values-uk", 18543, 265, {
                "strings-xml": ["strings.xml", 18543, 265, {}]
            }],
            "values-ja": ["values-ja", 12849, 201, {
                "strings-xml": ["strings.xml", 12849, 201, {}]
            }],
            "values-zh-rTW": ["values-zh-rTW", 13482, 235, {
                "strings-xml": ["strings.xml", 13482, 235, {}]
            }],
            "values-hu": ["values-hu", 13217, 220, {
                "strings-xml": ["strings.xml", 13217, 220, {}]
            }],
            "values-tr": ["values-tr", 15752, 265, {
                "strings-xml": ["strings.xml", 15752, 265, {}]
            }],
            "values-fr": ["values-fr", 15780, 264, {
                "strings-xml": ["strings.xml", 15780, 264, {}]
            }],
            "values-ru": ["values-ru", 13993, 209, {
                "strings-xml": ["strings.xml", 13993, 209, {}]
            }],
            "values-v14": ["values-v14", 1637, 43, {
                "styles-xml": ["styles.xml", 1637, 43, {}]
            }],
            "values-de": ["values-de", 15810, 271, {
                "strings-xml": ["strings.xml", 15810, 271, {}]
            }],
            "values-bg": ["values-bg", 17583, 246, {
                "strings-xml": ["strings.xml", 17583, 246, {}]
            }],
            "layout": ["layout", 131935, 3687, {
                "commit_header-xml": ["commit_header.xml", 3569, 102, {}],
                "commit_parent_item-xml": ["commit_parent_item.xml", 1078, 30, {}],
                "commit_compare_file_details_header-xml": ["commit_compare_file_details_header.xml", 892, 25, {}],
                "commit_file_view-xml": ["commit_file_view.xml", 1387, 40, {}],
                "item_list-xml": ["item_list.xml", 1434, 41, {}],
                "loading_item-xml": ["loading_item.xml", 1167, 34, {}],
                "repo_contributors-xml": ["repo_contributors.xml", 1296, 35, {}],
                "diff_line_dialog-xml": ["diff_line_dialog.xml", 2054, 63, {}],
                "gist_file_item-xml": ["gist_file_item.xml", 1334, 37, {}],
                "milestone-xml": ["milestone.xml", 1267, 34, {}],
                "comment_create-xml": ["comment_create.xml", 1244, 35, {}],
                "blob_item-xml": ["blob_item.xml", 1751, 50, {}],
                "comment_list-xml": ["comment_list.xml", 1430, 40, {}],
                "issue_details-xml": ["issue_details.xml", 1619, 49, {}],
                "commit_item-xml": ["commit_item.xml", 2556, 72, {}],
                "progress_dialog-xml": ["progress_dialog.xml", 1340, 38, {}],
                "repo_dialog-xml": ["repo_dialog.xml", 3162, 86, {}],
                "commit_comment_item-xml": ["commit_comment_item.xml", 866, 24, {}],
                "issue_header-xml": ["issue_header.xml", 5771, 169, {}],
                "commit_details_header-xml": ["commit_details_header.xml", 854, 24, {}],
                "commit_file_item-xml": ["commit_file_item.xml", 1497, 43, {}],
                "issue_number-xml": ["issue_number.xml", 1716, 60, {}],
                "pager_with_title-xml": ["pager_with_title.xml", 1816, 48, {}],
                "issues_filter_item-xml": ["issues_filter_item.xml", 1604, 45, {}],
                "comment_preview-xml": ["comment_preview.xml", 1755, 48, {}],
                "repo_issue_item-xml": ["repo_issue_item.xml", 1793, 50, {}],
                "issues_filter_header-xml": ["issues_filter_header.xml", 854, 23, {}],
                "org_item-xml": ["org_item.xml", 1435, 40, {}],
                "list_divider-xml": ["list_divider.xml", 847, 23, {}],
                "comment-xml": ["comment.xml", 2422, 68, {}],
                "footer_separator-xml": ["footer_separator.xml", 853, 23, {}],
                "path_item-xml": ["path_item.xml", 1425, 40, {}],
                "pager_with_tabs-xml": ["pager_with_tabs.xml", 1635, 46, {}],
                "ref_footer-xml": ["ref_footer.xml", 1593, 44, {}],
                "user_item-xml": ["user_item.xml", 1258, 36, {}],
                "commit-xml": ["commit.xml", 1024, 27, {}],
                "login-xml": ["login.xml", 2997, 82, {}],
                "issue_search-xml": ["issue_search.xml", 1280, 34, {}],
                "folder_item-xml": ["folder_item.xml", 2231, 65, {}],
                "issues_filter_edit-xml": ["issues_filter_edit.xml", 5543, 140, {}],
                "news_item-xml": ["news_item.xml", 2396, 68, {}],
                "user_repo_item-xml": ["user_repo_item.xml", 1349, 38, {}],
                "commit_diff_list-xml": ["commit_diff_list.xml", 1460, 41, {}],
                "repo_item-xml": ["repo_item.xml", 2822, 80, {}],
                "nav_dialog-xml": ["nav_dialog.xml", 2840, 79, {}],
                "org_dropdown_item-xml": ["org_dropdown_item.xml", 1454, 41, {}],
                "issues_filter_list-xml": ["issues_filter_list.xml", 1275, 34, {}],
                "repo_details-xml": ["repo_details.xml", 2181, 66, {}],
                "diff_comment_item-xml": ["diff_comment_item.xml", 955, 26, {}],
                "repo_code-xml": ["repo_code.xml", 1366, 40, {}],
                "repo_issue_list-xml": ["repo_issue_list.xml", 1318, 35, {}],
                "gist_create-xml": ["gist_create.xml", 3970, 103, {}],
                "tabbed_progress_pager-xml": ["tabbed_progress_pager.xml", 1129, 32, {}],
                "ref_item-xml": ["ref_item.xml", 1700, 47, {}],
                "gist_file_view-xml": ["gist_file_view.xml", 839, 21, {}],
                "dashboard_issue_item-xml": ["dashboard_issue_item.xml", 2086, 58, {}],
                "gist_header-xml": ["gist_header.xml", 1986, 56, {}],
                "commit_compare-xml": ["commit_compare.xml", 1033, 27, {}],
                "collaborator_item-xml": ["collaborator_item.xml", 1573, 45, {}],
                "commit_diff_line-xml": ["commit_diff_line.xml", 991, 26, {}],
                "gist_item-xml": ["gist_item.xml", 2861, 82, {}],
                "pager-xml": ["pager.xml", 842, 21, {}],
                "commit_diff_file_header-xml": ["commit_diff_file_header.xml", 1830, 52, {}],
                "issues_filter_details-xml": ["issues_filter_details.xml", 2184, 65, {}],
                "dialog_list_view-xml": ["dialog_list_view.xml", 896, 23, {}],
                "comment_item-xml": ["comment_item.xml", 866, 24, {}],
                "tab-xml": ["tab.xml", 2175, 59, {}],
                "milestone_item-xml": ["milestone_item.xml", 1747, 49, {}],
                "commit_comments-xml": ["commit_comments.xml", 859, 22, {}],
                "commit_list-xml": ["commit_list.xml", 1619, 48, {}],
                "list_view-xml": ["list_view.xml", 852, 22, {}],
                "issue_edit-xml": ["issue_edit.xml", 4987, 132, {}],
                "contributor_item-xml": ["contributor_item.xml", 1618, 49, {}],
                "label_item-xml": ["label_item.xml", 1305, 37, {}],
                "commit_file_details_header-xml": ["commit_file_details_header.xml", 922, 26, {}]
            }],
            "drawable-ldpi": ["drawable-ldpi", 26, 26, {
                "menu_random-png": ["menu_random.png", 1, 1, {}],
                "menu_bookmark-png": ["menu_bookmark.png", 1, 1, {}],
                "menu_delete_history-png": ["menu_delete_history.png", 2, 2, {}],
                "menu_issue_close-png": ["menu_issue_close.png", 2, 2, {}],
                "menu_delete-png": ["menu_delete.png", 1, 1, {}],
                "menu_share-png": ["menu_share.png", 1, 1, {}],
                "action_create-png": ["action_create.png", 0, 0, {}],
                "menu_filter-png": ["menu_filter.png", 1, 1, {}],
                "menu_issue_reopen-png": ["menu_issue_reopen.png", 2, 2, {}],
                "action_dashboard-png": ["action_dashboard.png", 1, 1, {}],
                "app_icon-png": ["app_icon.png", 3, 3, {}],
                "action_search-png": ["action_search.png", 1, 1, {}],
                "menu_star-png": ["menu_star.png", 1, 1, {}],
                "action_bookmark-png": ["action_bookmark.png", 0, 0, {}],
                "menu_refresh-png": ["menu_refresh.png", 2, 2, {}],
                "menu_issue_open-png": ["menu_issue_open.png", 2, 2, {}],
                "action_save-png": ["action_save.png", 2, 2, {}],
                "action_comment-png": ["action_comment.png", 1, 1, {}],
                "action_gist-png": ["action_gist.png", 1, 1, {}],
                "menu_edit-png": ["menu_edit.png", 1, 1, {}]
            }],
            "values-ko": ["values-ko", 11336, 201, {
                "strings-xml": ["strings.xml", 11336, 201, {}]
            }],
            "values-sv": ["values-sv", 12457, 217, {
                "strings-xml": ["strings.xml", 12457, 217, {}]
            }],
            "drawable-xhdpi": ["drawable-xhdpi", 65, 65, {
                "menu_random-png": ["menu_random.png", 4, 4, {}],
                "menu_bookmark-png": ["menu_bookmark.png", 2, 2, {}],
                "menu_delete_history-png": ["menu_delete_history.png", 5, 5, {}],
                "menu_issue_close-png": ["menu_issue_close.png", 5, 5, {}],
                "menu_delete-png": ["menu_delete.png", 3, 3, {}],
                "menu_share-png": ["menu_share.png", 3, 3, {}],
                "action_create-png": ["action_create.png", 0, 0, {}],
                "menu_filter-png": ["menu_filter.png", 2, 2, {}],
                "menu_issue_reopen-png": ["menu_issue_reopen.png", 5, 5, {}],
                "action_refresh-png": ["action_refresh.png", 1, 1, {}],
                "action_dashboard-png": ["action_dashboard.png", 2, 2, {}],
                "app_icon-png": ["app_icon.png", 9, 9, {}],
                "action_search-png": ["action_search.png", 1, 1, {}],
                "menu_star-png": ["menu_star.png", 4, 4, {}],
                "action_bookmark-png": ["action_bookmark.png", 1, 1, {}],
                "menu_refresh-png": ["menu_refresh.png", 5, 5, {}],
                "menu_issue_open-png": ["menu_issue_open.png", 5, 5, {}],
                "action_save-png": ["action_save.png", 3, 3, {}],
                "action_comment-png": ["action_comment.png", 1, 1, {}],
                "action_gist-png": ["action_gist.png", 1, 1, {}],
                "menu_edit-png": ["menu_edit.png", 3, 3, {}]
            }],
            "values": ["values", 31516, 682, {
                "styles-xml": ["styles.xml", 9229, 239, {}],
                "theme-xml": ["theme.xml", 1696, 37, {}],
                "colors-xml": ["colors.xml", 3819, 80, {}],
                "roboguice-xml": ["roboguice.xml", 778, 22, {}],
                "typeface-xml": ["typeface.xml", 1044, 28, {}],
                "strings-xml": ["strings.xml", 14950, 276, {}]
            }],
            "values-it": ["values-it", 15454, 264, {
                "strings-xml": ["strings.xml", 15454, 264, {}]
            }],
            "values-iw": ["values-iw", 15985, 264, {
                "strings-xml": ["strings.xml", 15985, 264, {}]
            }],
            "drawable": ["drawable", 26988, 776, {
                "spinner-xml": ["spinner.xml", 1214, 34, {}],
                "edit_text_cursor-xml": ["edit_text_cursor.xml", 835, 24, {}],
                "milestone_background-xml": ["milestone_background.xml", 1311, 41, {}],
                "label_background-xml": ["label_background.xml", 2089, 67, {}],
                "diff_add_background-xml": ["diff_add_background.xml", 854, 22, {}],
                "footer_selector-xml": ["footer_selector.xml", 877, 22, {}],
                "tab_selector_left_right-xml": ["tab_selector_left_right.xml", 944, 23, {}],
                "pager_title_background-xml": ["pager_title_background.xml", 1530, 43, {}],
                "list_item_background-xml": ["list_item_background.xml", 856, 22, {}],
                "list_divider-xml": ["list_divider.xml", 990, 30, {}],
                "diff_remove_background-xml": ["diff_remove_background.xml", 857, 22, {}],
                "tab_selector_right-xml": ["tab_selector_right.xml", 939, 23, {}],
                "edit_text_background-xml": ["edit_text_background.xml", 1466, 49, {}],
                "diff_marker_background-xml": ["diff_marker_background.xml", 860, 22, {}],
                "actionbar_spinner-xml": ["actionbar_spinner.xml", 993, 29, {}],
                "section_selector-xml": ["section_selector.xml", 878, 22, {}],
                "section_selected_background-xml": ["section_selected_background.xml", 1138, 35, {}],
                "sign_up_background-xml": ["sign_up_background.xml", 1001, 30, {}],
                "actionbar_background-xml": ["actionbar_background.xml", 1380, 40, {}],
                "header_separator_background-xml": ["header_separator_background.xml", 1530, 43, {}],
                "section_background-xml": ["section_background.xml", 1138, 35, {}],
                "tab_selector_left-xml": ["tab_selector_left.xml", 938, 23, {}],
                "milestone_closed_background-xml": ["milestone_closed_background.xml", 916, 26, {}],
                "inset_background-xml": ["inset_background.xml", 1454, 49, {}]
            }],
            "values-pt": ["values-pt", 11863, 205, {
                "strings-xml": ["strings.xml", 11863, 205, {}]
            }]
        }],
        "libs": ["libs", 2, 1, {
            "-gitignore": [".gitignore", 2, 1, {}]
        }],
        "-classpath": [".classpath", 374, 9, {}]
    }],
    "pom-xml": ["pom.xml", 2264, 57, {}],
    "proguard-cfg": ["proguard.cfg", 2480, 57, {}],
    "integration-tests": ["integration-tests", 124236, 3338, {
        "src": ["src", 91960, 2837, {
            "main.java.com.github.mobile": ["main.java.com.github.mobile", 91960, 2837, {
                                "tests": ["tests", 91960, 2837, {
                                    "repo": ["repo", 9249, 286, {
                                        "RepositoryUriMatcherTest-java": ["RepositoryUriMatcherTest.java", 2954, 91, {}],
                                        "SearchActivityTest-java": ["SearchActivityTest.java", 1265, 45, {}],
                                        "RepositoryEventMatcherTest-java": ["RepositoryEventMatcherTest.java", 1951, 54, {}],
                                        "RecentRepositoriesTest-java": ["RecentRepositoriesTest.java", 3079, 96, {}]
                                    }],
                                    "gist": ["gist", 12502, 400, {
                                        "GistStoreTest-java": ["GistStoreTest.java", 1615, 49, {}],
                                        "GistUriMatcherTest-java": ["GistUriMatcherTest.java", 2077, 69, {}],
                                        "CreateCommentActivityTest-java": ["CreateCommentActivityTest.java", 2002, 66, {}],
                                        "CreateGistActivityTest-java": ["CreateGistActivityTest.java", 2015, 65, {}],
                                        "GistUrlMatcherTest-java": ["GistUrlMatcherTest.java", 2004, 57, {}],
                                        "GistFilesViewActivityTest-java": ["GistFilesViewActivityTest.java", 2789, 94, {}]
                                    }],
                                    "issue": ["issue", 15368, 461, {
                                        "IssueUrlMatcherTest-java": ["IssueUrlMatcherTest.java", 1834, 52, {}],
                                        "IssueUriMatcherTest-java": ["IssueUriMatcherTest.java", 3584, 102, {}],
                                        "IssueStoreTest-java": ["IssueStoreTest.java", 2027, 57, {}],
                                        "CreateCommentActivityTest-java": ["CreateCommentActivityTest.java", 2008, 66, {}],
                                        "EditIssueActivityTest-java": ["EditIssueActivityTest.java", 2068, 68, {}],
                                        "EditIssuesFilterActivityTest-java": ["EditIssuesFilterActivityTest.java", 1557, 49, {}],
                                        "IssueFilterTest-java": ["IssueFilterTest.java", 2290, 67, {}]
                                    }],
                                    "util": ["util", 6922, 230, {
                                        "HtmlUtilsTest-java": ["HtmlUtilsTest.java", 6922, 230, {}]
                                    }],
                                    "ActivityTest-java": ["ActivityTest.java", 2436, 102, {}],
                                    "NewsEventTextTest-java": ["NewsEventTextTest.java", 9546, 302, {}],
                                    "FiltersViewActivityTest-java": ["FiltersViewActivityTest.java", 966, 32, {}],
                                    "commit": ["commit", 21084, 617, {
                                        "CommitUrlMatcherTest-java": ["CommitUrlMatcherTest.java", 2163, 61, {}],
                                        "CreateCommentActivityTest-java": ["CreateCommentActivityTest.java", 2079, 68, {}],
                                        "DiffStylerTest-java": ["DiffStylerTest.java", 4331, 143, {}],
                                        "CommitUriMatcherTest-java": ["CommitUriMatcherTest.java", 2983, 87, {}],
                                        "FullCommitTest-java": ["FullCommitTest.java", 4326, 115, {}],
                                        "CommitUtilsTest-java": ["CommitUtilsTest.java", 5202, 143, {}]
                                    }],
                                    "ref": ["ref", 4331, 107, {
                                        "RefUtilsTest-java": ["RefUtilsTest.java", 4331, 107, {}]
                                    }],
                                    "user": ["user", 9556, 300, {
                                        "LoginActivityTest-java": ["LoginActivityTest.java", 2106, 67, {}],
                                        "UserUrlMatcherTest-java": ["UserUrlMatcherTest.java", 2352, 78, {}],
                                        "UserUriMatcherTest-java": ["UserUriMatcherTest.java", 2613, 87, {}],
                                        "UserComparatorTest-java": ["UserComparatorTest.java", 2485, 68, {}]
                                    }]
                            }]
            }]
        }],
        "-project": [".project", 859, 34, {}],
        "AndroidManifest-xml": ["AndroidManifest.xml", 627, 20, {}],
        "pom-xml": ["pom.xml", 3350, 86, {}],
        "project-properties": ["project.properties", 372, 12, {}],
        "-settings": [".settings", 26610, 339, {
            "org-eclipse-jdt-core-prefs": ["org.eclipse.jdt.core.prefs", 23821, 282, {}],
            "org-eclipse-jdt-ui-prefs": ["org.eclipse.jdt.ui.prefs", 2789, 57, {}]
        }],
        "-classpath": [".classpath", 458, 10, {}]
    }],
    "-gitignore": [".gitignore", 191, 20, {}],
    "README-md": ["README.md", 3083, 65, {}],
    "-travis-yml": [".travis.yml", 569, 15, {}]
}];


    code_hierarchy_data2 = ["Project: MyTracks", 9352896, 49663, {
    "src": ["src", 1124692, 34307, {
        "com.google.android.apps.mytracks": ["com.google.android.apps.mytracks", 1124692, 34307, {
                            "ColoredPath-java": ["ColoredPath.java", 1528, 62, {}],
                            "ImportActivity-java": ["ImportActivity.java", 6549, 205, {}],
                            "io": ["io", 343243, 10721, {
                                "sendtogoogle": ["sendtogoogle", 37993, 1269, {
                                    "SendToGoogleUtils-java": ["SendToGoogleUtils.java", 3686, 119, {}],
                                    "AbstractSendActivity-java": ["AbstractSendActivity.java", 3888, 135, {}],
                                    "ConfirmSharingActivity-java": ["ConfirmSharingActivity.java", 3535, 106, {}],
                                    "AbstractSendAsyncTask-java": ["AbstractSendAsyncTask.java", 3255, 146, {}],
                                    "AccountChooserActivity-java": ["AccountChooserActivity.java", 9998, 295, {}],
                                    "UploadResultActivity-java": ["UploadResultActivity.java", 6553, 178, {}],
                                    "SendRequest-java": ["SendRequest.java", 7078, 290, {}]
                                }],
                                "gdata": ["gdata", 70177, 2223, {
                                    "QueryParamsImpl-java": ["QueryParamsImpl.java", 2728, 104, {}],
                                    "GDataClientFactory-java": ["GDataClientFactory.java", 1745, 52, {}],
                                    "AndroidGDataClient-java": ["AndroidGDataClient.java", 14424, 458, {}],
                                    "docs": ["docs", 13813, 389, {
                                        "XmlDocsGDataParserFactory-java": ["XmlDocsGDataParserFactory.java", 2313, 72, {}],
                                        "DocumentsClient-java": ["DocumentsClient.java", 1591, 47, {}],
                                        "SpreadsheetsClient-java": ["SpreadsheetsClient.java", 9909, 270, {}]
                                    }],
                                    "maps": ["maps", 37467, 1220, {
                                        "MapsClient-java": ["MapsClient.java", 3470, 103, {}],
                                        "XmlMapsGDataParser-java": ["XmlMapsGDataParser.java", 6061, 164, {}],
                                        "MapsFeatureMetadata-java": ["MapsFeatureMetadata.java", 1662, 89, {}],
                                        "MapsGDataConverter-java": ["MapsGDataConverter.java", 6996, 179, {}],
                                        "MapsMapMetadata-java": ["MapsMapMetadata.java", 1001, 53, {}],
                                        "XmlMapsGDataParserFactory-java": ["XmlMapsGDataParserFactory.java", 2948, 95, {}],
                                        "MapsFeature-java": ["MapsFeature.java", 5608, 220, {}],
                                        "XmlMapsGDataSerializer-java": ["XmlMapsGDataSerializer.java", 8530, 263, {}],
                                        "MapsConstants-java": ["MapsConstants.java", 406, 17, {}],
                                        "MapFeatureEntry-java": ["MapFeatureEntry.java", 785, 37, {}]
                                    }]
                                }],
                                "docs": ["docs", 27498, 792, {
                                    "SendDocsActivity-java": ["SendDocsActivity.java", 1799, 53, {}],
                                    "SendDocsAsyncTask-java": ["SendDocsAsyncTask.java", 10073, 316, {}],
                                    "SendDocsUtils-java": ["SendDocsUtils.java", 15626, 423, {}]
                                }],
                                "maps": ["maps", 42466, 1304, {
                                    "SendMapsActivity-java": ["SendMapsActivity.java", 2479, 73, {}],
                                    "SendMapsAsyncTask-java": ["SendMapsAsyncTask.java", 17194, 519, {}],
                                    "ChooseMapAsyncTask-java": ["ChooseMapAsyncTask.java", 7054, 247, {}],
                                    "SendMapsUtils-java": ["SendMapsUtils.java", 7966, 217, {}],
                                    "ChooseMapActivity-java": ["ChooseMapActivity.java", 7773, 248, {}]
                                }],
                                "file": ["file", 89606, 2781, {
                                    "SaveActivity-java": ["SaveActivity.java", 6962, 200, {}],
                                    "TrackWriterFactory-java": ["TrackWriterFactory.java", 4182, 146, {}],
                                    "TrackWriter-java": ["TrackWriter.java", 2142, 78, {}],
                                    "SaveAsyncTask-java": ["SaveAsyncTask.java", 6780, 224, {}],
                                    "TrackWriterImpl-java": ["TrackWriterImpl.java", 11059, 375, {}],
                                    "KmlTrackWriter-java": ["KmlTrackWriter.java", 13241, 359, {}],
                                    "GpxImporter-java": ["GpxImporter.java", 16118, 525, {}],
                                    "TcxTrackWriter-java": ["TcxTrackWriter.java", 11987, 331, {}],
                                    "TrackFormatWriter-java": ["TrackFormatWriter.java", 2977, 126, {}],
                                    "CsvTrackWriter-java": ["CsvTrackWriter.java", 8057, 235, {}],
                                    "GpxTrackWriter-java": ["GpxTrackWriter.java", 6101, 182, {}]
                                }],
                                "backup": ["backup", 50708, 1600, {
                                    "BackupAsyncTask-java": ["BackupAsyncTask.java", 3084, 112, {}],
                                    "ExternalFileBackup-java": ["ExternalFileBackup.java", 8980, 265, {}],
                                    "DatabaseImporter-java": ["DatabaseImporter.java", 6275, 199, {}],
                                    "DatabaseDumper-java": ["DatabaseDumper.java", 7903, 249, {}],
                                    "RestoreAsyncTask-java": ["RestoreAsyncTask.java", 2891, 105, {}],
                                    "MyTracksBackupAgent-java": ["MyTracksBackupAgent.java", 3626, 100, {}],
                                    "PreferenceBackupHelper-java": ["PreferenceBackupHelper.java", 7030, 207, {}],
                                    "RestoreChooserActivity-java": ["RestoreChooserActivity.java", 3843, 122, {}],
                                    "BackupActivity-java": ["BackupActivity.java", 2588, 92, {}],
                                    "RestoreActivity-java": ["RestoreActivity.java", 3203, 108, {}],
                                    "BackupPreferencesListener-java": ["BackupPreferencesListener.java", 1285, 41, {}]
                                }],
                                "fusiontables": ["fusiontables", 24795, 752, {
                                    "SendFusionTablesAsyncTask-java": ["SendFusionTablesAsyncTask.java", 16193, 477, {}],
                                    "SendFusionTablesActivity-java": ["SendFusionTablesActivity.java", 2332, 69, {}],
                                    "SendFusionTablesUtils-java": ["SendFusionTablesUtils.java", 6270, 206, {}]
                                }]
                            }],
                            "HelpActivity-java": ["HelpActivity.java", 2195, 66, {}],
                            "TrackListActivity-java": ["TrackListActivity.java", 26937, 734, {}],
                            "ImportAsyncTask-java": ["ImportAsyncTask.java", 6574, 222, {}],
                            "MarkerEditActivity-java": ["MarkerEditActivity.java", 6636, 192, {}],
                            "MapOverlay-java": ["MapOverlay.java", 9071, 287, {}],
                            "MarkerDetailActivity-java": ["MarkerDetailActivity.java", 4678, 136, {}],
                            "MarkerListActivity-java": ["MarkerListActivity.java", 11346, 300, {}],
                            "TrackController-java": ["TrackController.java", 5138, 141, {}],
                            "stats": ["stats", 12551, 412, {
                                "TripStatisticsUpdater-java": ["TripStatisticsUpdater.java", 9186, 278, {}],
                                "DoubleBuffer-java": ["DoubleBuffer.java", 3365, 134, {}]
                            }],
                            "AggregatedStatsActivity-java": ["AggregatedStatsActivity.java", 2099, 64, {}],
                            "content": ["content", 96565, 2989, {
                                "TrackDataType-java": ["TrackDataType.java", 1107, 33, {}],
                                "TrackDataManager-java": ["TrackDataManager.java", 3785, 126, {}],
                                "SearchEngineProvider-java": ["SearchEngineProvider.java", 1463, 45, {}],
                                "SearchEngine-java": ["SearchEngine.java", 13818, 406, {}],
                                "DescriptionGeneratorImpl-java": ["DescriptionGeneratorImpl.java", 9711, 276, {}],
                                "TrackDataHub-java": ["TrackDataHub.java", 28589, 869, {}],
                                "MyTracksProvider-java": ["MyTracksProvider.java", 15263, 467, {}],
                                "DataSourceManager-java": ["DataSourceManager.java", 9624, 324, {}],
                                "DataSourceListener-java": ["DataSourceListener.java", 2009, 78, {}],
                                "TrackDataListener-java": ["TrackDataListener.java", 4278, 152, {}],
                                "DataSource-java": ["DataSource.java", 6918, 213, {}]
                            }],
                            "maps": ["maps", 19679, 613, {
                                "TrackPath-java": ["TrackPath.java", 1208, 44, {}],
                                "TrackPathDescriptor-java": ["TrackPathDescriptor.java", 1083, 40, {}],
                                "DynamicSpeedTrackPathDescriptor-java": ["DynamicSpeedTrackPathDescriptor.java", 4993, 150, {}],
                                "FixedSpeedTrackPathDescriptor-java": ["FixedSpeedTrackPathDescriptor.java", 2588, 77, {}],
                                "TrackPathFactory-java": ["TrackPathFactory.java", 1513, 48, {}],
                                "SingleColorTrackPath-java": ["SingleColorTrackPath.java", 2376, 78, {}],
                                "TrackPathUtils-java": ["TrackPathUtils.java", 1964, 62, {}],
                                "MultiColorTrackPath-java": ["MultiColorTrackPath.java", 3954, 114, {}]
                            }],
                            "widgets": ["widgets", 24245, 592, {
                                "TrackWidgetProvider-java": ["TrackWidgetProvider.java", 18831, 454, {}],
                                "TrackWidgetConfigActivity-java": ["TrackWidgetConfigActivity.java", 5414, 138, {}]
                            }],
                            "MyTracksApplication-java": ["MyTracksApplication.java", 1284, 42, {}],
                            "fragments": ["fragments", 90748, 2741, {
                                "DeleteOneMarkerDialogFragment-java": ["DeleteOneMarkerDialogFragment.java", 3069, 79, {}],
                                "ChartFragment-java": ["ChartFragment.java", 16056, 540, {}],
                                "EulaDialogFragment-java": ["EulaDialogFragment.java", 3902, 125, {}],
                                "DeleteOneTrackDialogFragment-java": ["DeleteOneTrackDialogFragment.java", 3866, 104, {}],
                                "AboutDialogFragment-java": ["AboutDialogFragment.java", 2135, 61, {}],
                                "InstallEarthDialogFragment-java": ["InstallEarthDialogFragment.java", 2227, 65, {}],
                                "StatsFragment-java": ["StatsFragment.java", 7767, 283, {}],
                                "DeleteAllTrackDialogFragment-java": ["DeleteAllTrackDialogFragment.java", 1863, 56, {}],
                                "ConfirmPlayDialogFragment-java": ["ConfirmPlayDialogFragment.java", 3817, 102, {}],
                                "ChooseActivityDialogFragment-java": ["ChooseActivityDialogFragment.java", 10058, 263, {}],
                                "FrequencyDialogFragment-java": ["FrequencyDialogFragment.java", 3891, 111, {}],
                                "WelcomeDialogFragment-java": ["WelcomeDialogFragment.java", 2019, 67, {}],
                                "ChooseUploadServiceDialogFragment-java": ["ChooseUploadServiceDialogFragment.java", 6961, 179, {}],
                                "MyTracksMapFragment-java": ["MyTracksMapFragment.java", 23117, 706, {}]
                            }],
                            "AutoCompleteTextPreference-java": ["AutoCompleteTextPreference.java", 2073, 66, {}],
                            "ContextualActionModeCallback-java": ["ContextualActionModeCallback.java", 1063, 34, {}],
                            "TabManager-java": ["TabManager.java", 5067, 151, {}],
                            "SensorStateActivity-java": ["SensorStateActivity.java", 10038, 308, {}],
                            "util": ["util", 119192, 3602, {
                                "FileUtils-java": ["FileUtils.java", 6188, 205, {}],
                                "DialogUtils-java": ["DialogUtils.java", 4377, 126, {}],
                                "TrackRecordingServiceConnectionUtils-java": ["TrackRecordingServiceConnectionUtils.java", 7013, 195, {}],
                                "StringUtils-java": ["StringUtils.java", 13011, 391, {}],
                                "Api10Adapter-java": ["Api10Adapter.java", 1581, 47, {}],
                                "Api11Adapter-java": ["Api11Adapter.java", 4013, 123, {}],
                                "Api8Adapter-java": ["Api8Adapter.java", 4266, 140, {}],
                                "ApiAdapter-java": ["ApiAdapter.java", 4910, 174, {}],
                                "Api9Adapter-java": ["Api9Adapter.java", 1964, 72, {}],
                                "GoogleLocationUtils-java": ["GoogleLocationUtils.java", 1516, 46, {}],
                                "ChartsExtendedEncoder-java": ["ChartsExtendedEncoder.java", 1963, 52, {}],
                                "EulaUtils-java": ["EulaUtils.java", 2282, 67, {}],
                                "SystemUtils-java": ["SystemUtils.java", 2886, 90, {}],
                                "UriUtils-java": ["UriUtils.java", 1730, 61, {}],
                                "StatsUtils-java": ["StatsUtils.java", 13966, 353, {}],
                                "TrackNameUtils-java": ["TrackNameUtils.java", 3977, 130, {}],
                                "ChartURLGenerator-java": ["ChartURLGenerator.java", 5211, 166, {}],
                                "Api14Adapter-java": ["Api14Adapter.java", 2186, 74, {}],
                                "ApiAdapterFactory-java": ["ApiAdapterFactory.java", 1569, 54, {}],
                                "TrackIconUtils-java": ["TrackIconUtils.java", 4888, 161, {}],
                                "IntentUtils-java": ["IntentUtils.java", 4178, 107, {}],
                                "ListItemUtils-java": ["ListItemUtils.java", 3983, 111, {}],
                                "ResourceUtils-java": ["ResourceUtils.java", 2378, 94, {}],
                                "PreferencesUtils-java": ["PreferencesUtils.java", 8398, 225, {}],
                                "AnalyticsUtils-java": ["AnalyticsUtils.java", 1580, 57, {}],
                                "BluetoothDeviceUtils-java": ["BluetoothDeviceUtils.java", 2122, 64, {}],
                                "UnitConversions-java": ["UnitConversions.java", 1791, 54, {}],
                                "LocationUtils-java": ["LocationUtils.java", 5265, 163, {}]
                            }],
                            "AbstractMyTracksActivity-java": ["AbstractMyTracksActivity.java", 2053, 77, {}],
                            "Constants-java": ["Constants.java", 4073, 134, {}],
                            "IntegerListPreference-java": ["IntegerListPreference.java", 2836, 96, {}],
                            "TrackEditActivity-java": ["TrackEditActivity.java", 5434, 160, {}],
                            "ChartValueSeries-java": ["ChartValueSeries.java", 7017, 265, {}],
                            "settings": ["settings", 58223, 1523, {
                                "SharingSettingsActivity-java": ["SharingSettingsActivity.java", 2987, 86, {}],
                                "BackupSettingsActivity-java": ["BackupSettingsActivity.java", 5383, 150, {}],
                                "SettingsActivity-java": ["SettingsActivity.java", 8681, 232, {}],
                                "ChartSettingsActivity-java": ["ChartSettingsActivity.java", 1682, 55, {}],
                                "StatsSettingsActivity-java": ["StatsSettingsActivity.java", 3537, 102, {}],
                                "RecordingSettingsActivity-java": ["RecordingSettingsActivity.java", 12485, 275, {}],
                                "SensorSettingsActivity-java": ["SensorSettingsActivity.java", 7361, 177, {}],
                                "AbstractSettingsActivity-java": ["AbstractSettingsActivity.java", 5697, 169, {}],
                                "MapSettingsActivity-java": ["MapSettingsActivity.java", 10410, 277, {}]
                            }],
                            "BootReceiver-java": ["BootReceiver.java", 2351, 62, {}],
                            "SearchListActivity-java": ["SearchListActivity.java", 19379, 489, {}],
                            "TrackDetailActivity-java": ["TrackDetailActivity.java", 20193, 531, {}],
                            "ChartView-java": ["ChartView.java", 30194, 1019, {}],
                            "services": ["services", 164440, 5271, {
                                "tasks": ["tasks", 24215, 823, {
                                    "PeriodicTaskFactory-java": ["PeriodicTaskFactory.java", 994, 34, {}],
                                    "SplitPeriodicTaskFactory-java": ["SplitPeriodicTaskFactory.java", 957, 32, {}],
                                    "PeriodicTaskExecutor-java": ["PeriodicTaskExecutor.java", 5559, 203, {}],
                                    "AnnouncementPeriodicTaskFactory-java": ["AnnouncementPeriodicTaskFactory.java", 999, 32, {}],
                                    "SplitPeriodicTask-java": ["SplitPeriodicTask.java", 1204, 40, {}],
                                    "AnnouncementPeriodicTask-java": ["AnnouncementPeriodicTask.java", 10588, 336, {}],
                                    "TimerTaskExecutor-java": ["TimerTaskExecutor.java", 2665, 102, {}],
                                    "PeriodicTask-java": ["PeriodicTask.java", 1249, 44, {}]
                                }],
                                "TrackRecordingService-java": ["TrackRecordingService.java", 42430, 1239, {}],
                                "ControlRecordingService-java": ["ControlRecordingService.java", 4073, 139, {}],
                                "AbsoluteLocationListenerPolicy-java": ["AbsoluteLocationListenerPolicy.java", 1310, 53, {}],
                                "MyTracksLocationManager-java": ["MyTracksLocationManager.java", 5319, 164, {}],
                                "RemoveTempFilesService-java": ["RemoveTempFilesService.java", 3948, 122, {}],
                                "LocationListenerPolicy-java": ["LocationListenerPolicy.java", 1437, 48, {}],
                                "sensors": ["sensors", 74521, 2441, {
                                    "SensorManager-java": ["SensorManager.java", 3283, 131, {}],
                                    "PolarSensorManager-java": ["PolarSensorManager.java", 921, 31, {}],
                                    "PolarMessageParser-java": ["PolarMessageParser.java", 4382, 141, {}],
                                    "SensorUtils-java": ["SensorUtils.java", 3579, 116, {}],
                                    "BluetoothConnectionManager-java": ["BluetoothConnectionManager.java", 8567, 295, {}],
                                    "ZephyrSensorManager-java": ["ZephyrSensorManager.java", 926, 32, {}],
                                    "MessageParser-java": ["MessageParser.java", 1036, 36, {}],
                                    "ant": ["ant", 36106, 1172, {
                                        "CadenceCounter-java": ["CadenceCounter.java", 5312, 179, {}],
                                        "SpeedDistanceChannelConfiguration-java": ["SpeedDistanceChannelConfiguration.java", 1545, 56, {}],
                                        "HeartRateChannelConfiguration-java": ["HeartRateChannelConfiguration.java", 1412, 52, {}],
                                        "BikeCadenceChannelConfiguration-java": ["BikeCadenceChannelConfiguration.java", 1691, 56, {}],
                                        "CombinedBikeChannelConfiguration-java": ["CombinedBikeChannelConfiguration.java", 1694, 57, {}],
                                        "ChannelConfiguration-java": ["ChannelConfiguration.java", 3029, 124, {}],
                                        "AntSensorValue-java": ["AntSensorValue.java", 1324, 61, {}],
                                        "AntSensorManager-java": ["AntSensorManager.java", 20099, 587, {}]
                                    }],
                                    "SensorManagerFactory-java": ["SensorManagerFactory.java", 3488, 118, {}],
                                    "StrideReadings-java": ["StrideReadings.java", 2891, 81, {}],
                                    "ZephyrMessageParser-java": ["ZephyrMessageParser.java", 3730, 110, {}],
                                    "BluetoothSensorManager-java": ["BluetoothSensorManager.java", 5612, 178, {}]
                                }],
                                "TrackRecordingServiceConnection-java": ["TrackRecordingServiceConnection.java", 4801, 168, {}],
                                "AdaptiveLocationListenerPolicy-java": ["AdaptiveLocationListenerPolicy.java", 2386, 74, {}]
                            }]
        }]
    }],
    "-project": [".project", 841, 35, {}],
    "MyTracks-launch": ["MyTracks.launch", 1297, 25, {}],
    "lint-xml": ["lint.xml", 939, 19, {}],
    "proguard-cfg": ["proguard.cfg", 4095, 126, {}],
    "res": ["res", 8202155, 12087, {
        "values-eu": ["values-eu", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-et": ["values-et", 116253, 9, {
            "strings-xml": ["strings.xml", 116253, 9, {}]
        }],
        "values-es-rPY": ["values-es-rPY", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-bg": ["values-bg", 13, 13, {
            "strings-xml": ["strings.xml", 13, 13, {}]
        }],
        "values-es-rPR": ["values-es-rPR", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-en-rZA": ["values-en-rZA", 115487, 42, {
            "strings-xml": ["strings.xml", 115487, 42, {}]
        }],
        "values-el": ["values-el", 13, 13, {
            "strings-xml": ["strings.xml", 13, 13, {}]
        }],
        "values-es-rPE": ["values-es-rPE", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "xml": ["xml", 16914, 405, {
            "settings-xml": ["settings.xml", 2009, 55, {}],
            "recording_settings-xml": ["recording_settings.xml", 2692, 56, {}],
            "search-xml": ["search.xml", 655, 14, {}],
            "sharing_settings-xml": ["sharing_settings.xml", 1216, 29, {}],
            "backup_settings-xml": ["backup_settings.xml", 1041, 27, {}],
            "chart_settings-xml": ["chart_settings.xml", 1865, 46, {}],
            "track_widget_info-xml": ["track_widget_info.xml", 1009, 26, {}],
            "stats_settings-xml": ["stats_settings.xml", 1926, 47, {}],
            "map_settings-xml": ["map_settings.xml", 1970, 48, {}],
            "sensor_settings-xml": ["sensor_settings.xml", 2531, 57, {}]
        }],
        "layout": ["layout", 79817, 2145, {
            "marker_edit-xml": ["marker_edit.xml", 2967, 75, {}],
            "list_item-xml": ["list_item.xml", 2636, 74, {}],
            "marker_edit_buttons-xml": ["marker_edit_buttons.xml", 958, 27, {}],
            "track_widget_config-xml": ["track_widget_config.xml", 1654, 44, {}],
            "marker_list-xml": ["marker_list.xml", 1042, 29, {}],
            "track_widget_4x2-xml": ["track_widget_4x2.xml", 6517, 164, {}],
            "marker_detail-xml": ["marker_detail.xml", 2087, 57, {}],
            "chart-xml": ["chart.xml", 1261, 35, {}],
            "sensor_state-xml": ["sensor_state.xml", 2217, 66, {}],
            "track_edit_buttons-xml": ["track_edit_buttons.xml", 996, 28, {}],
            "confirm_dialog-xml": ["confirm_dialog.xml", 1392, 39, {}],
            "choose_map-xml": ["choose_map.xml", 1003, 29, {}],
            "search_list-xml": ["search_list.xml", 1042, 29, {}],
            "bottom_buttons-xml": ["bottom_buttons.xml", 1002, 28, {}],
            "aggregated_stats-xml": ["aggregated_stats.xml", 964, 27, {}],
            "track_edit-xml": ["track_edit.xml", 2188, 57, {}],
            "track_controller-xml": ["track_controller.xml", 2738, 74, {}],
            "choose_map_item-xml": ["choose_map_item.xml", 1349, 37, {}],
            "upload_result-xml": ["upload_result.xml", 4528, 120, {}],
            "track_widget_4x3-xml": ["track_widget_4x3.xml", 6565, 164, {}],
            "track_detail-xml": ["track_detail.xml", 1876, 53, {}],
            "stats_core-xml": ["stats_core.xml", 4516, 140, {}],
            "help-xml": ["help.xml", 5251, 140, {}],
            "map-xml": ["map.xml", 1648, 43, {}],
            "help_buttons-xml": ["help_buttons.xml", 975, 28, {}],
            "choose_upload_service-xml": ["choose_upload_service.xml", 2673, 70, {}],
            "about-xml": ["about.xml", 1675, 49, {}],
            "track_list-xml": ["track_list.xml", 1426, 40, {}],
            "choose_activity_list_item-xml": ["choose_activity_list_item.xml", 2084, 53, {}],
            "stats-xml": ["stats.xml", 1898, 56, {}],
            "track_widget_4x4-xml": ["track_widget_4x4.xml", 6727, 168, {}],
            "track_widget_4x1-xml": ["track_widget_4x1.xml", 3962, 102, {}]
        }],
        "values-es": ["values-es", 119554, 3, {
            "strings-xml": ["strings.xml", 119554, 3, {}]
        }],
        "menu": ["menu", 11331, 315, {
            "marker_detail-xml": ["marker_detail.xml", 1188, 33, {}],
            "track_detail-xml": ["track_detail.xml", 3361, 96, {}],
            "track_list-xml": ["track_list.xml", 2186, 60, {}],
            "list_context_menu-xml": ["list_context_menu.xml", 1200, 33, {}],
            "search_list-xml": ["search_list.xml", 916, 24, {}],
            "map-xml": ["map.xml", 1377, 40, {}],
            "marker_list-xml": ["marker_list.xml", 1103, 29, {}]
        }],
        "values-uk": ["values-uk", 13, 13, {
            "strings-xml": ["strings.xml", 13, 13, {}]
        }],
        "values-ja": ["values-ja", 121006, 2, {
            "strings-xml": ["strings.xml", 121006, 2, {}]
        }],
        "values-zh": ["values-zh", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "drawable-mdpi-v11": ["drawable-mdpi-v11", 40, 40, {
            "my_tracks_notification_icon-png": ["my_tracks_notification_icon.png", 40, 40, {}]
        }],
        "values-v14": ["values-v14", 2154, 56, {
            "styles-xml": ["styles.xml", 1487, 37, {}],
            "dimens-xml": ["dimens.xml", 667, 19, {}]
        }],
        "values-es-rSV": ["values-es-rSV", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-v11": ["values-v11", 1085, 26, {
            "styles-xml": ["styles.xml", 1085, 26, {}]
        }],
        "values-bn": ["values-bn", 115843, 52, {
            "strings-xml": ["strings.xml", 115843, 52, {}]
        }],
        "drawable-ldpi": ["drawable-ldpi", 776, 776, {
            "track_run-png": ["track_run.png", 55, 55, {}],
            "google_fusion_tables_icon-png": ["google_fusion_tables_icon.png", 0, 0, {}],
            "success-png": ["success.png", 39, 39, {}],
            "track_bike-png": ["track_bike.png", 45, 45, {}],
            "track_paused-png": ["track_paused.png", 2, 2, {}],
            "track_ski-png": ["track_ski.png", 54, 54, {}],
            "blue_pushpin-png": ["blue_pushpin.png", 58, 58, {}],
            "tab_chart-png": ["tab_chart.png", 50, 50, {}],
            "track_recording-png": ["track_recording.png", 2, 2, {}],
            "track_walk-png": ["track_walk.png", 53, 53, {}],
            "track_airplane-png": ["track_airplane.png", 40, 40, {}],
            "track_boat-png": ["track_boat.png", 43, 43, {}],
            "track_drive-png": ["track_drive.png", 43, 43, {}],
            "google_docs_icon-png": ["google_docs_icon.png", 0, 0, {}],
            "yellow_pushpin-png": ["yellow_pushpin.png", 58, 58, {}],
            "track_snow_boarding-png": ["track_snow_boarding.png", 47, 47, {}],
            "warning-png": ["warning.png", 0, 0, {}],
            "google_maps_icon-png": ["google_maps_icon.png", 0, 0, {}],
            "my_tracks_notification_icon-png": ["my_tracks_notification_icon.png", 38, 38, {}],
            "failure-png": ["failure.png", 39, 39, {}],
            "tab_stats-png": ["tab_stats.png", 50, 50, {}],
            "tab_map-png": ["tab_map.png", 60, 60, {}]
        }],
        "values-es-rCR": ["values-es-rCR", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-en-rSG": ["values-en-rSG", 115487, 42, {
            "strings-xml": ["strings.xml", 115487, 42, {}]
        }],
        "values-ko": ["values-ko", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-ro": ["values-ro", 118903, 27, {
            "strings-xml": ["strings.xml", 118903, 27, {}]
        }],
        "drawable-xhdpi-v11": ["drawable-xhdpi-v11", 39, 39, {
            "my_tracks_notification_icon-png": ["my_tracks_notification_icon.png", 39, 39, {}]
        }],
        "values-ru": ["values-ru", 130006, 2, {
            "strings-xml": ["strings.xml", 130006, 2, {}]
        }],
        "values-es-rCO": ["values-es-rCO", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-es-rCL": ["values-es-rCL", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-es-rVE": ["values-es-rVE", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-es-rAR": ["values-es-rAR", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-lv": ["values-lv", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-lt": ["values-lt", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-ln": ["values-ln", 120338, 24, {
            "strings-xml": ["strings.xml", 120338, 24, {}]
        }],
        "values-fr-rCH": ["values-fr-rCH", 120338, 24, {
            "strings-xml": ["strings.xml", 120338, 24, {}]
        }],
        "values-fr-rCA": ["values-fr-rCA", 120489, 7, {
            "strings-xml": ["strings.xml", 120489, 7, {}]
        }],
        "values-de": ["values-de", 119018, 13, {
            "strings-xml": ["strings.xml", 119018, 13, {}]
        }],
        "values-da": ["values-da", 116678, 11, {
            "strings-xml": ["strings.xml", 116678, 11, {}]
        }],
        "values-es-rHN": ["values-es-rHN", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "layout-v14": ["layout-v14", 3931, 111, {
            "marker_edit_buttons-xml": ["marker_edit_buttons.xml", 958, 27, {}],
            "track_edit_buttons-xml": ["track_edit_buttons.xml", 996, 28, {}],
            "bottom_buttons-xml": ["bottom_buttons.xml", 1002, 28, {}],
            "help_buttons-xml": ["help_buttons.xml", 975, 28, {}]
        }],
        "values-de-rAT": ["values-de-rAT", 119018, 13, {
            "strings-xml": ["strings.xml", 119018, 13, {}]
        }],
        "values-tl": ["values-tl", 119357, 2, {
            "strings-xml": ["strings.xml", 119357, 2, {}]
        }],
        "values-th": ["values-th", 14, 14, {
            "strings-xml": ["strings.xml", 14, 14, {}]
        }],
        "drawable-xhdpi": ["drawable-xhdpi", 451, 451, {
            "btn_stop_1-png": ["btn_stop_1.png", 8, 8, {}],
            "menu_help-png": ["menu_help.png", 1, 1, {}],
            "menu_import-png": ["menu_import.png", 37, 37, {}],
            "btn_pause-png": ["btn_pause.png", 7, 7, {}],
            "menu_settings-png": ["menu_settings.png", 1, 1, {}],
            "menu_search-png": ["menu_search.png", 2, 2, {}],
            "menu_send_google-png": ["menu_send_google.png", 1, 1, {}],
            "menu_markers-png": ["menu_markers.png", 37, 37, {}],
            "red_dot-png": ["red_dot.png", 57, 57, {}],
            "menu_share-png": ["menu_share.png", 1, 1, {}],
            "btn_record-png": ["btn_record.png", 9, 9, {}],
            "green_dot-png": ["green_dot.png", 56, 56, {}],
            "my_location_pressed-png": ["my_location_pressed.png", 3, 3, {}],
            "menu_aggregated_statistics-png": ["menu_aggregated_statistics.png", 36, 36, {}],
            "menu_start_gps-png": ["menu_start_gps.png", 2, 2, {}],
            "menu_map_layer-png": ["menu_map_layer.png", 2, 2, {}],
            "menu_delete-png": ["menu_delete.png", 1, 1, {}],
            "menu_voice_frequency-png": ["menu_voice_frequency.png", 42, 42, {}],
            "menu_insert_marker-png": ["menu_insert_marker.png", 1, 1, {}],
            "my_location_normal-png": ["my_location_normal.png", 1, 1, {}],
            "btn_stop_0-png": ["btn_stop_0.png", 8, 8, {}],
            "menu_sensor_state-png": ["menu_sensor_state.png", 1, 1, {}],
            "menu_show_on_map-png": ["menu_show_on_map.png", 50, 50, {}],
            "menu_save-png": ["menu_save.png", 1, 1, {}],
            "menu_split_frequency-png": ["menu_split_frequency.png", 43, 43, {}],
            "menu_play-png": ["menu_play.png", 41, 41, {}],
            "ab_transparent_dark_holo-9-png": ["ab_transparent_dark_holo.9.png", 0, 0, {}],
            "menu_edit-png": ["menu_edit.png", 2, 2, {}]
        }],
        "values-tr": ["values-tr", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-ar": ["values-ar", 128423, 2, {
            "strings-xml": ["strings.xml", 128423, 2, {}]
        }],
        "drawable-hdpi": ["drawable-hdpi", 1285, 1285, {
            "track_run-png": ["track_run.png", 58, 58, {}],
            "btn_stop_1-png": ["btn_stop_1.png", 7, 7, {}],
            "success-png": ["success.png", 39, 39, {}],
            "menu_sensor_state-png": ["menu_sensor_state.png", 1, 1, {}],
            "menu_help-png": ["menu_help.png", 1, 1, {}],
            "track_bike-png": ["track_bike.png", 49, 49, {}],
            "track_paused-png": ["track_paused.png", 2, 2, {}],
            "track_ski-png": ["track_ski.png", 57, 57, {}],
            "my_location_normal-png": ["my_location_normal.png", 1, 1, {}],
            "blue_pushpin-png": ["blue_pushpin.png", 61, 61, {}],
            "btn_pause-png": ["btn_pause.png", 6, 6, {}],
            "tab_chart-png": ["tab_chart.png", 51, 51, {}],
            "menu_settings-png": ["menu_settings.png", 1, 1, {}],
            "menu_search-png": ["menu_search.png", 1, 1, {}],
            "menu_send_google-png": ["menu_send_google.png", 1, 1, {}],
            "menu_markers-png": ["menu_markers.png", 49, 49, {}],
            "red_dot-png": ["red_dot.png", 56, 56, {}],
            "menu_share-png": ["menu_share.png", 1, 1, {}],
            "google_fusion_tables_icon-png": ["google_fusion_tables_icon.png", 0, 0, {}],
            "btn_record-png": ["btn_record.png", 7, 7, {}],
            "green_dot-png": ["green_dot.png", 55, 55, {}],
            "my_location_pressed-png": ["my_location_pressed.png", 2, 2, {}],
            "track_airplane-png": ["track_airplane.png", 51, 51, {}],
            "track_boat-png": ["track_boat.png", 53, 53, {}],
            "menu_aggregated_statistics-png": ["menu_aggregated_statistics.png", 50, 50, {}],
            "menu_start_gps-png": ["menu_start_gps.png", 1, 1, {}],
            "menu_map_layer-png": ["menu_map_layer.png", 1, 1, {}],
            "menu_delete-png": ["menu_delete.png", 1, 1, {}],
            "track_drive-png": ["track_drive.png", 45, 45, {}],
            "menu_voice_frequency-png": ["menu_voice_frequency.png", 52, 52, {}],
            "google_docs_icon-png": ["google_docs_icon.png", 0, 0, {}],
            "track_recording-png": ["track_recording.png", 3, 3, {}],
            "yellow_pushpin-png": ["yellow_pushpin.png", 50, 50, {}],
            "menu_insert_marker-png": ["menu_insert_marker.png", 1, 1, {}],
            "track_snow_boarding-png": ["track_snow_boarding.png", 58, 58, {}],
            "warning-png": ["warning.png", 1, 1, {}],
            "menu_import-png": ["menu_import.png", 47, 47, {}],
            "btn_stop_0-png": ["btn_stop_0.png", 6, 6, {}],
            "google_maps_icon-png": ["google_maps_icon.png", 1, 1, {}],
            "my_tracks_notification_icon-png": ["my_tracks_notification_icon.png", 0, 0, {}],
            "failure-png": ["failure.png", 41, 41, {}],
            "tab_stats-png": ["tab_stats.png", 40, 40, {}],
            "track_walk-png": ["track_walk.png", 44, 44, {}],
            "menu_show_on_map-png": ["menu_show_on_map.png", 59, 59, {}],
            "menu_save-png": ["menu_save.png", 1, 1, {}],
            "menu_split_frequency-png": ["menu_split_frequency.png", 53, 53, {}],
            "menu_play-png": ["menu_play.png", 51, 51, {}],
            "ab_transparent_dark_holo-9-png": ["ab_transparent_dark_holo.9.png", 0, 0, {}],
            "tab_map-png": ["tab_map.png", 68, 68, {}],
            "menu_edit-png": ["menu_edit.png", 1, 1, {}]
        }],
        "values-es-rMX": ["values-es-rMX", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-en-rIN": ["values-en-rIN", 115487, 42, {
            "strings-xml": ["strings.xml", 115487, 42, {}]
        }],
        "values-fi": ["values-fi", 117377, 3, {
            "strings-xml": ["strings.xml", 117377, 3, {}]
        }],
        "values-en-rIE": ["values-en-rIE", 115487, 42, {
            "strings-xml": ["strings.xml", 115487, 42, {}]
        }],
        "values-fa": ["values-fa", 127919, 8, {
            "strings-xml": ["strings.xml", 127919, 8, {}]
        }],
        "values-es-rDO": ["values-es-rDO", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-nb": ["values-nb", 116363, 13, {
            "strings-xml": ["strings.xml", 116363, 13, {}]
        }],
        "values-nl": ["values-nl", 117567, 8, {
            "strings-xml": ["strings.xml", 117567, 8, {}]
        }],
        "values-fr": ["values-fr", 120338, 24, {
            "strings-xml": ["strings.xml", 120338, 24, {}]
        }],
        "values-en-rGB": ["values-en-rGB", 115487, 42, {
            "strings-xml": ["strings.xml", 115487, 42, {}]
        }],
        "values-es-rNI": ["values-es-rNI", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "drawable-hdpi-v11": ["drawable-hdpi-v11", 40, 40, {
            "my_tracks_notification_icon-png": ["my_tracks_notification_icon.png", 40, 40, {}]
        }],
        "values-gl": ["values-gl", 118409, 2, {
            "strings-xml": ["strings.xml", 118409, 2, {}]
        }],
        "values-es-rGT": ["values-es-rGT", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-zh-rHK": ["values-zh-rHK", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-de-rCH": ["values-de-rCH", 119018, 13, {
            "strings-xml": ["strings.xml", 119018, 13, {}]
        }],
        "values": ["values", 531270, 4103, {
            "styles-xml": ["styles.xml", 17117, 397, {}],
            "dimens-xml": ["dimens.xml", 667, 19, {}],
            "colors-xml": ["colors.xml", 2127, 50, {}],
            "values-id": ["values-id", 117238, 2, {
                "strings-xml": ["strings.xml", 117238, 2, {}]
            }],
            "keys-xml": ["keys.xml", 5817, 92, {}],
            "plurals-xml": ["plurals.xml", 4264, 83, {}],
            "values-pt-rBR": ["values-pt-rBR", 118713, 29, {
                "strings-xml": ["strings.xml", 118713, 29, {}]
            }],
            "arrays_do_not_translate-xml": ["arrays_do_not_translate.xml", 10509, 259, {}],
            "do_not_translate-xml": ["do_not_translate.xml", 9868, 101, {}],
            "strings-xml": ["strings.xml", 125337, 3069, {}],
            "values-es-rPA": ["values-es-rPA", 119613, 2, {
                "strings-xml": ["strings.xml", 119613, 2, {}]
            }]
        }],
        "values-vi": ["values-vi", 123518, 2, {
            "strings-xml": ["strings.xml", 123518, 2, {}]
        }],
        "drawable": ["drawable", 839, 22, {
            "my_location-xml": ["my_location.xml", 839, 22, {}]
        }],
        "drawable-mdpi": ["drawable-mdpi", 1304, 1304, {
            "track_run-png": ["track_run.png", 56, 56, {}],
            "btn_stop_1-png": ["btn_stop_1.png", 5, 5, {}],
            "arrow_320-png": ["arrow_320.png", 0, 0, {}],
            "success-png": ["success.png", 39, 39, {}],
            "menu_sensor_state-png": ["menu_sensor_state.png", 1, 1, {}],
            "menu_help-png": ["menu_help.png", 1, 1, {}],
            "track_bike-png": ["track_bike.png", 47, 47, {}],
            "track_paused-png": ["track_paused.png", 2, 2, {}],
            "track_ski-png": ["track_ski.png", 57, 57, {}],
            "arrow_180-png": ["arrow_180.png", 0, 0, {}],
            "my_location_normal-png": ["my_location_normal.png", 0, 0, {}],
            "blue_pushpin-png": ["blue_pushpin.png", 58, 58, {}],
            "btn_pause-png": ["btn_pause.png", 5, 5, {}],
            "tab_chart-png": ["tab_chart.png", 50, 50, {}],
            "menu_settings-png": ["menu_settings.png", 1, 1, {}],
            "menu_search-png": ["menu_search.png", 1, 1, {}],
            "track_widget_background-9-png": ["track_widget_background.9.png", 3, 3, {}],
            "menu_markers-png": ["menu_markers.png", 47, 47, {}],
            "red_dot-png": ["red_dot.png", 53, 53, {}],
            "menu_share-png": ["menu_share.png", 1, 1, {}],
            "google_fusion_tables_icon-png": ["google_fusion_tables_icon.png", 0, 0, {}],
            "btn_record-png": ["btn_record.png", 5, 5, {}],
            "green_dot-png": ["green_dot.png", 53, 53, {}],
            "my_location_pressed-png": ["my_location_pressed.png", 1, 1, {}],
            "track_airplane-png": ["track_airplane.png", 46, 46, {}],
            "track_boat-png": ["track_boat.png", 55, 55, {}],
            "menu_aggregated_statistics-png": ["menu_aggregated_statistics.png", 47, 47, {}],
            "menu_start_gps-png": ["menu_start_gps.png", 1, 1, {}],
            "menu_map_layer-png": ["menu_map_layer.png", 1, 1, {}],
            "menu_delete-png": ["menu_delete.png", 1, 1, {}],
            "track_drive-png": ["track_drive.png", 43, 43, {}],
            "menu_voice_frequency-png": ["menu_voice_frequency.png", 52, 52, {}],
            "google_docs_icon-png": ["google_docs_icon.png", 0, 0, {}],
            "track_recording-png": ["track_recording.png", 3, 3, {}],
            "yellow_pushpin-png": ["yellow_pushpin.png", 58, 58, {}],
            "menu_insert_marker-png": ["menu_insert_marker.png", 1, 1, {}],
            "track_snow_boarding-png": ["track_snow_boarding.png", 47, 47, {}],
            "warning-png": ["warning.png", 1, 1, {}],
            "menu_import-png": ["menu_import.png", 47, 47, {}],
            "google_maps_icon-png": ["google_maps_icon.png", 0, 0, {}],
            "btn_stop_0-png": ["btn_stop_0.png", 5, 5, {}],
            "menu_send_google-png": ["menu_send_google.png", 1, 1, {}],
            "my_tracks_notification_icon-png": ["my_tracks_notification_icon.png", 49, 49, {}],
            "failure-png": ["failure.png", 39, 39, {}],
            "tab_stats-png": ["tab_stats.png", 52, 52, {}],
            "track_walk-png": ["track_walk.png", 43, 43, {}],
            "menu_show_on_map-png": ["menu_show_on_map.png", 57, 57, {}],
            "menu_save-png": ["menu_save.png", 1, 1, {}],
            "menu_split_frequency-png": ["menu_split_frequency.png", 53, 53, {}],
            "menu_play-png": ["menu_play.png", 51, 51, {}],
            "ab_transparent_dark_holo-9-png": ["ab_transparent_dark_holo.9.png", 0, 0, {}],
            "tab_map-png": ["tab_map.png", 63, 63, {}],
            "menu_edit-png": ["menu_edit.png", 1, 1, {}]
        }],
        "values-cs": ["values-cs", 118406, 3, {
            "strings-xml": ["strings.xml", 118406, 3, {}]
        }],
        "raw": ["raw", 9, 9, {
            "mytracks_empty_spreadsheet-ods": ["mytracks_empty_spreadsheet.ods", 9, 9, {}]
        }],
        "values-pt-rPT": ["values-pt-rPT", 118694, 3, {
            "strings-xml": ["strings.xml", 118694, 3, {}]
        }],
        "values-ms": ["values-ms", 117283, 42, {
            "strings-xml": ["strings.xml", 117283, 42, {}]
        }],
        "values-zh-rCN": ["values-zh-rCN", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-ca": ["values-ca", 118891, 20, {
            "strings-xml": ["strings.xml", 118891, 20, {}]
        }],
        "values-sl": ["values-sl", 117846, 3, {
            "strings-xml": ["strings.xml", 117846, 3, {}]
        }],
        "values-sk": ["values-sk", 118918, 6, {
            "strings-xml": ["strings.xml", 118918, 6, {}]
        }],
        "values-he": ["values-he", 123684, 4, {
            "strings-xml": ["strings.xml", 123684, 4, {}]
        }],
        "values-hi": ["values-hi", 139678, 3, {
            "strings-xml": ["strings.xml", 139678, 3, {}]
        }],
        "drawable-ldpi-v11": ["drawable-ldpi-v11", 41, 41, {
            "my_tracks_notification_icon-png": ["my_tracks_notification_icon.png", 41, 41, {}]
        }],
        "values-mo": ["values-mo", 118903, 27, {
            "strings-xml": ["strings.xml", 118903, 27, {}]
        }],
        "values-hr": ["values-hr", 117506, 22, {
            "strings-xml": ["strings.xml", 117506, 22, {}]
        }],
        "values-zh-rTW": ["values-zh-rTW", 11, 11, {
            "strings-xml": ["strings.xml", 11, 11, {}]
        }],
        "values-hu": ["values-hu", 120524, 9, {
            "strings-xml": ["strings.xml", 120524, 9, {}]
        }],
        "values-sv": ["values-sv", 116807, 2, {
            "strings-xml": ["strings.xml", 116807, 2, {}]
        }],
        "values-sr": ["values-sr", 130397, 2, {
            "strings-xml": ["strings.xml", 130397, 2, {}]
        }],
        "values-es-rBO": ["values-es-rBO", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-es-rUS": ["values-es-rUS", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-es-rUY": ["values-es-rUY", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-pl": ["values-pl", 118867, 43, {
            "strings-xml": ["strings.xml", 118867, 43, {}]
        }],
        "values-in": ["values-in", 117238, 2, {
            "strings-xml": ["strings.xml", 117238, 2, {}]
        }],
        "values-it": ["values-it", 118436, 33, {
            "strings-xml": ["strings.xml", 118436, 33, {}]
        }],
        "values-iw": ["values-iw", 123684, 4, {
            "strings-xml": ["strings.xml", 123684, 4, {}]
        }],
        "values-es-rEC": ["values-es-rEC", 119613, 2, {
            "strings-xml": ["strings.xml", 119613, 2, {}]
        }],
        "values-pt": ["values-pt", 118713, 29, {
            "strings-xml": ["strings.xml", 118713, 29, {}]
        }]
    }],
    "project-properties": ["project.properties", 574, 17, {}],
    "AndroidManifest-xml": ["AndroidManifest.xml", 13968, 270, {}],
    "libs": ["libs", 3963, 2768, {
        "google-common-jar": ["google-common.jar", 438, 438, {}],
        "google-http-client-1-5-0-beta-jar": ["google-http-client-1.5.0-beta.jar", 192, 192, {}],
        "gson-1-6-jar": ["gson-1.6.jar", 161, 161, {}],
        "README-txt": ["README.txt", 1230, 35, {}],
        "android-support-v4-jar": ["android-support-v4.jar", 341, 341, {}],
        "antlib-jar": ["antlib.jar", 31, 31, {}],
        "commons-codec-1-3-jar": ["commons-codec-1.3.jar", 45, 45, {}],
        "google-api-client-1-5-0-beta-jar": ["google-api-client-1.5.0-beta.jar", 43, 43, {}],
        "guava-r09-jar": ["guava-r09.jar", 1117, 1117, {}],
        "jsr305-1-3-9-jar": ["jsr305-1.3.9.jar", 32, 32, {}],
        "commons-logging-1-1-1-jar": ["commons-logging-1.1.1.jar", 59, 59, {}],
        "jackson-core-asl-1-6-7-jar": ["jackson-core-asl-1.6.7.jar", 196, 196, {}],
        "libGoogleAnalytics-jar": ["libGoogleAnalytics.jar", 45, 45, {}],
        "google-oauth-client-1-5-0-beta-jar": ["google-oauth-client-1.5.0-beta.jar", 33, 33, {}]
    }],
    "-classpath": [".classpath", 372, 9, {}]
}];
