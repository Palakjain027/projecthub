import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import { useAuthStore, useCartItemCount, useUnreadCount } from '@/stores';
import { authService } from '@/services';

export function MainLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartItemCount();
  const unreadCount = useUnreadCount();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore error
    }
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: '/explore', label: 'Explore' },
    { href: '/categories', label: 'Categories' },
    { href: '/freelance', label: 'Hire Freelancer' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl hidden sm:inline">ProjectHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search Button */}
              <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                <Search className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Cart */}
                  <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <Link to="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="hidden md:inline text-sm font-medium">{user?.username}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover shadow-lg z-50">
                          <div className="p-2 border-b">
                            <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                          <div className="p-1">
                            <Link
                              to="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted w-full"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to={`/profile/${user?.username}`}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted w-full"
                            >
                              <User className="h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              to="/dashboard/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted w-full"
                            >
                              <Settings className="h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                          </div>
                          <div className="p-1 border-t">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted w-full text-destructive"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Log out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </form>
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">P</span>
                </div>
                <span className="font-bold text-xl">ProjectHub</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                The marketplace for developers to buy, sell, and discover amazing projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/explore" className="hover:text-foreground">Explore</Link></li>
                <li><Link to="/categories" className="hover:text-foreground">Categories</Link></li>
                <li><Link to="/trending" className="hover:text-foreground">Trending</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sellers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/sell" className="hover:text-foreground">Start Selling</Link></li>
                <li><Link to="/seller-guide" className="hover:text-foreground">Seller Guide</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ProjectHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
