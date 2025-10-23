"use client";
import { MainPage } from "@/components/main";
import UserLoading from "@/components/userloading";
import { IsAdmin, IsUserAdmin, retrieveSessionToken, Role, ValueToRole } from "@/lib/utils";
import { deleteUser, fetchCurrentUser, fetchUsers } from "@/lib/serverUtils";
import { useEffect, useState } from "react";
import { MoreVertical, Edit2, Trash2, UserCheck, UserX } from "lucide-react";

const MembersList = ({ members, onReloadMembers, user }: { members: any, onReloadMembers: any, user: any }) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    const toggleDropdown = (memberId: any, event: any) => {
        if (activeDropdown === memberId) {
            setActiveDropdown(null);
        } else {
            const button = event.currentTarget;
            const rect = button.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right - 192 + window.scrollX, // 192px is the width of the dropdown (w-48)
            });
            setActiveDropdown(memberId);
        }
    };

    const getRoleBadgeColor = (role: Role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-700 border-red-200';
            case "supervisor":
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleAction = async (action: string, member: any) => {
        setActiveDropdown(null);

        // Higher/Same Rank Authority
        if (member.role <= user.role) {
            if (action == "delete" && member.id != user.id) {
                await deleteUser(member.id);
            }
        }

        // Any Rank Authority
        {

        }

        if (onReloadMembers) {
            onReloadMembers();
        }
    };

    // Close dropdown when clicking outside
    const handleBackdropClick = () => {
        if (activeDropdown) {
            setActiveDropdown(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Members ({members.length})</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your organization members</p>
            </div>

            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {members.map((member: any) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                                                {member.full_name.split(' ').map((n: any) => n[0]).join('')}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-700">{member.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(ValueToRole(member.role))}`}>
                                        {ValueToRole(member.role)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => toggleDropdown(member.id, e)}
                                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                        >
                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Render dropdowns outside the scrollable container */}
            {activeDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={handleBackdropClick}
                    />
                    <div
                        className="fixed z-20 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1"
                        style={{
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                        }}
                    >
                        {members.find((m: any) => m.id === activeDropdown).role <= user.role && <>
                            {false && <>
                                <button
                                    onClick={() => handleAction('edit', members.find((m: any) => m.id === activeDropdown))}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Member
                                </button>
                                <button
                                    onClick={() => handleAction('change-role', members.find((m: any) => m.id === activeDropdown))}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Change Role
                                </button>
                                <button
                                    onClick={() => handleAction('suspend', members.find((m: any) => m.id === activeDropdown))}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Suspend User
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                            </>}

                            {activeDropdown != user.id &&
                                <button
                                    onClick={() => handleAction('delete', members.find((m: any) => m.id === activeDropdown))}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Member
                                </button>
                            }
                        </>}
                    </div>
                </>
            )}

            {members.length === 0 && (
                <div className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                        <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding your first member.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function MembersPage() {
    const [user, setUser] = useState<any>(null);
    const [members, setMembers] = useState<any>([]);
    const [reloadMembers, setReloadMembers] = useState(false);
    const doReloadMembers = () => setReloadMembers(prev => !prev);

    useEffect(() => {
        (async () => {
            const cuser = await fetchCurrentUser(retrieveSessionToken());
            setUser(cuser ?? null)
        })();
    }, []);

    useEffect(() => {
        (async () => {
            setMembers(await fetchUsers());
        })();
    }, [reloadMembers]);

    if (!user)
        return <UserLoading />;

    if (!IsUserAdmin(user))
        return (
            <MainPage>
                <p className="p-8 text-xl font-bold text-center text-red-800 w-full">
                    Insufficient permissions
                </p>
            </MainPage>
        );

    return (
        <MainPage>
            <div className="container mx-auto px-4 py-6">
                <MembersList
                    members={members}
                    onReloadMembers={doReloadMembers}
                    user={user}
                />
            </div>
        </MainPage>
    );
}